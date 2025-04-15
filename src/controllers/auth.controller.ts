import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AuthService } from "../services/auth.service";
import { MailService } from "../services/mail.service";
import { UserRepository } from "../repositories/user.repo";
import { authenticator } from "otplib";
import { NotFoundError } from "../errors/notFoundError";
import { UnauthorizedError } from "../errors/unauthorizedError";


@injectable()
export class AuthController {
  constructor(
    @inject(AuthService) private authService: AuthService,
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
      const tempUser = await this.authService.registerTempUser({
        name,
        email,
        phone,
        password,
        otp,
      });

      // Send OTP email
      await this.mailService.sendWelcomeEmail(
        email,
        'Sign up OTP',
        `Welcome to FixMyRide. Your OTP is ${otp}`
      );

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
      const { user, accessToken,refreshToken } = await this.authService.registerUser(
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
     const {user,accessToken,refreshToken} = await this.authService.userLogin(email,password);
    
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
//admin login

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
     const {user,accessToken,refreshToken} = await this.authService.adminLogin(email,password);
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
      res.status(500).json({ message: "Server error" });
    }
  }


  async providerLogin(req: Request, res: Response): Promise<void> {
    try {
      console.log('The request for the provider login from the adminLogin controller');
      const { email, password } = req.body;
     const {user,accessToken,refreshToken} = await this.authService.providerLogin(email,password);
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
      res.status(500).json({ message: "Server error" });
    }
  }


  async logout(req: Request, res: Response) {
    try {
      const result = await this.authService.logout();
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  }

  async adminLogout(req: Request, res: Response) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "admin logged out successfully" });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  }

 
  async providerLogout(req: Request, res: Response) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "Provider logged out successfully" });
    } catch (error) {
      console.error("Provider logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  }




  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log('The auth controller function hits for the forgot password');
  
      const { email } = req.body;
      const { user, token } = await this.authService.forgotPassword(email);
  
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
      const result = await this.authService.resetPassword(token,password);
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
  

  // async refreshToken(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const refreshToken = req.cookies.refreshToken;
  //     if (!refreshToken) throw new AppError("No Token", 401);

  //     const data = await this.authService.refreshToken(refreshToken);
  //     if (!data) {
  //       throw new AppError("Unauthorized", 406);
  //     }
  //     res.cookie("refreshToken", data.refreshToken, {
  //       httpOnly: true,
  //       sameSite: "strict",
  //       secure: true,
  //       maxAge: 24 * 60 * 60 * 1000,
  //     });
  //     res.status(201).json({
  //       accessToken: data.accessToken,
  //       id: data.id,
  //       name: data.name,
  //       role: data.role,
  //       verified: data.verified,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
 
}

