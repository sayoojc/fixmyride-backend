import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AdminAuthService } from "../../services/admin/auth.services";
import { IAdminAuthController } from "../../interfaces/controllers/admin/IAdminAuthController";
import {
  AdminLoginRequestSchema,
  AdminLoginResponseSchema,
  AdminLogoutResponseSchema,
  AdminLoginRequestDTO,
  AdminLoginResponseDTO,
  AdminLogoutResponseDTO
} from "../../dtos/controllers/admin/adminAuth.controller.dto";

@injectable()
export class AdminAuthController implements IAdminAuthController {
  constructor(
    @inject(AdminAuthService) private adminAuthService: AdminAuthService
  ) {}

  async adminLogin(
    req: Request<{}, {}, AdminLoginRequestDTO>,
    res: Response<AdminLoginResponseDTO>
  ): Promise<void> {
    try {
      const parsed = AdminLoginRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten() } as any);
        return;
      }

      const { email, password } = parsed.data;
      const { user, accessToken, refreshToken } =
        await this.adminAuthService.adminLogin(email, password);

      
      const { _id, name, email:rawEmail, role } = user.toObject();
const filteredUser = { _id: _id.toString(), name, email:rawEmail, role };
       const response: AdminLoginResponseDTO = {
        message: "Login successful",
        user: filteredUser,
      };

      AdminLoginResponseSchema.parse(response); // optional runtime validation

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

      res.status(200).json(response);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Server error" } as any); // fallback type
    }
  }

  async adminLogout(
    req: Request,
    res: Response<AdminLogoutResponseDTO>
  ): Promise<void> {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      const response: AdminLogoutResponseDTO = {
        message: "admin logged out successfully",
      };

      AdminLogoutResponseSchema.parse(response);

      res.status(200).json(response);
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ message: "Failed to logout" } as any);
    }
  }
}
