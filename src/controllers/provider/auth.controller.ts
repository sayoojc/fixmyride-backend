import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { ProviderAuthService } from "../../services/provider/auth.service";
import { MailService } from "../../services/mail.service";
import { UserRepository } from "../../repositories/user.repo";
import { authenticator } from "otplib";
import { NotFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";


@injectable()
export class ProviderAuthController {
  constructor(
    @inject(ProviderAuthService) private providerAuthService: ProviderAuthService,
    @inject(MailService) private mailService: MailService,
    @inject(UserRepository) private userRepository: UserRepository
  ) {}

  
 

  async providerRegisterTemp(req: Request, res: Response): Promise<void> {
    try {
      console.log('provider register temp controller hits');
      const data = req.body;
      console.log('data',data);
      const secret = authenticator.generateSecret();
      const otp = authenticator.generate(secret);

      console.log(`OTP: ${otp}, Secret: ${secret}`);

      // Store temporary user data
      const tempUser = await this.providerAuthService.providerRegisterTemp({...data,otp});
      console.log('Temp user ',tempUser);
      if(!tempUser){
        throw new Error('Temporary user creation is failed');
      }

      // Send OTP email
      await this.mailService.sendWelcomeEmail(
        data.email,
        'Sign up OTP',
        `Welcome to FixMyRide. Your OTP is ${otp}`
      );

      res
        .status(201)
        .json({ success: true, message: "OTP sent" });
    } catch (error) {
      console.log('catch block of the controller function for the provider temp registration')
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async providerRegister(req: Request, res: Response): Promise<void> {
    try {
      console.log('The provider register function hits');
      const data = req.body;
      console.log('data',data);

      // Store temporary user data
      const provider = await this.providerAuthService.providerRegister({...data});
   
      console.log('Temp user ',provider);
      if(!provider){
        throw new Error('Temporary user creation is failed');
      }

  
      res
        .status(201)
        .json({ success: true, message: "OTP sent" });
    } catch (error) {
      console.log('catch block of the controller function for the provider registration')
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async providerLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
     const {provider,accessToken,refreshToken} = await this.providerAuthService.providerLogin(email,password);
     const { password:userPassword, ...userWithoutPassword } = provider.toObject(); 

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
      if (error instanceof UnauthorizedError) {
        res.status(401).json({ message: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
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



 
}

