import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { UserAuthService } from "../../services/user/auth.services";
import { MailService } from "../../services/mail.service";
import { UserRepository } from "../../repositories/user.repo";
import { authenticator } from "otplib";
import { NotFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";


@injectable()
export class UserAuthController {
  constructor(
    @inject(UserAuthService) private userAuthService: UserAuthService,
    @inject(MailService) private mailService: MailService,
    @inject(UserRepository) private userRepository: UserRepository
  ) {}

  /**
   * @desc    Temporarily registers a user and sends an OTP via email
   * @route   POST /register-temp
   * @access  Public
   */
  async registerTemp(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password } = req.body;
      const secret = authenticator.generateSecret();
      const otp = authenticator.generate(secret);

      console.log(`OTP: ${otp}, Secret: ${secret}`);

      // Store temporary user data
      const tempUser = await this.userAuthService.registerTempUser({
        name,
        email,
        phone,
        password,
        otp,
      });

      // Send OTP email
    const mailResult =   await this.mailService.sendWelcomeEmail(
        email,
        'Sign up OTP',
        `Welcome to FixMyRide. Your OTP is ${otp}`
      );


      console.log('mail result',mailResult)
      res
        .status(201)
        .json({ success: true, message: "OTP sent", email: tempUser.email });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  /**
   * @desc    Registers a user permanently after OTP verification
   * @route   POST /signup
   * @access  Public
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { otpValue, email,phone } = req.body;
      console.log("OTP Value:", otpValue);
      console.log("Email:", email);
      console.log("phone:", phone);

      // Register user after OTP validation
      const { user, accessToken,refreshToken } = await this.userAuthService.registerUser(
        otpValue,
        email,
        phone
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

   
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

      res.status(201).json({
        message: "User registered successfully",
        user,
      });
    } catch (error) {
      console.log("The catch block in register in auth controller");
      res.status(400).json({ message: (error as Error).message });
    }
  }

  /**
   * @desc    Handles user login and verifies credentials
   * @route   POST /login
   * @access  Public
   */
  async userLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
     const {user,accessToken,refreshToken} = await this.userAuthService.userLogin(email,password);
    
     const { password:userPassword, ...userWithoutPassword } = user.toObject(); 
     res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
  });

 
  res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });


      res.status(200).json({ message: "Login successful", user:userWithoutPassword });
    } catch (error) {
      console.error("Error during login:", error);

  if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
    console.log('the error message from the user login fromn the auth dcontroller',error.message)
    res.status(error.statusCode || 401).json({ message: error.message });
    return 
  
  }

  res.status(500).json({ message: "Server error" });
  return
  
    }
  }


  async logout(req: Request, res: Response) {
    try {
   //   const result = await this.authService.logout();
     res.clearCookie("accessToken");
     res.clearCookie("refreshToken");
     res.status(200).json({ message: "User logged out successfully" });
   } catch (error) {
     console.error("Logout error:", error);
     res.status(500).json({ message: "Failed to logout" });
   }
 }


  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log('The auth controller function hits for the forgot password');
  
      const { email } = req.body;
      const { user, token } = await this.userAuthService.forgotPassword(email);
  
      if (user) {
        const resetUrl = `http://localhost:3000/reset-password/${token}`; 
        
        await this.mailService.sendWelcomeEmail(
          email,
          'Reset your password',
          `
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        `
        );
      }
  
      res.status(200).json({
        success: true,
        message: "If email exists, a reset link has been sent",
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
  
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const {token,password} = req.body;
      const result = await this.userAuthService.resetPassword(token,password);
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
  

 
}

