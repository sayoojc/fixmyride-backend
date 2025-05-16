import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AdminAuthService } from "../../services/admin/auth.services";
import { MailService } from "../../services/mail.service";
import { UserRepository } from "../../repositories/user.repo";
import { IAdminAuthController } from "../../interfaces/controllers/admin/IAdminAuthController";

@injectable()
export class AdminAuthController implements IAdminAuthController {
  constructor(
    @inject(AdminAuthService) private adminAuthService: AdminAuthService,
    @inject(MailService) private mailService: MailService,
    @inject(UserRepository) private userRepository: UserRepository
  ) {}

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } =
        await this.adminAuthService.adminLogin(email, password);
      const { password: userPassword, ...userWithoutPassword } =
        user.toObject();
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

      res
        .status(200)
        .json({ message: "Login successful", user: userWithoutPassword });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Server error" });
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
}
