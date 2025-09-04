import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { StatusCode } from "../../enums/statusCode.enum";
import { TYPES } from "../../containers/types";
import { IAdminAuthService } from "../../interfaces/services/admin/IAdminAuthService";
import { IAdminAuthController } from "../../interfaces/controllers/admin/IAdminAuthController";
import {
  AdminLoginRequestSchema,
  AdminLoginResponseSchema,
  AdminLogoutResponseSchema,
  AdminLoginRequestDTO,
  AdminLoginResponseDTO,
  AdminLogoutResponseDTO,
  ErrorResponseDTO,
} from "../../dtos/controllers/admin/adminAuth.controller.dto";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
@injectable()
export class AdminAuthController implements IAdminAuthController {
  constructor(
    @inject(TYPES.AdminAuthService)
    private readonly _adminAuthService: IAdminAuthService
  ) {}
  async adminLogin(
    req: Request<{}, {}, AdminLoginRequestDTO>,
    res: Response<AdminLoginResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const parsed = AdminLoginRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ errors: parsed.error.flatten() } as any);
        return;
      }

      const { email, password } = parsed.data;
      const { user, accessToken, refreshToken } =
        await this._adminAuthService.adminLogin(email, password);

      const { _id, name, email: rawEmail, role } = user.toObject();
      const filteredUser = { _id: _id.toString(), name, email: rawEmail, role };
      const response: AdminLoginResponseDTO = {
        message: RESPONSE_MESSAGES.LOGIN_SUCCESS("Admin"),
        user: filteredUser,
      };

      AdminLoginResponseSchema.parse(response);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Error during login:", error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message:
            error && typeof error === "object" && "message" in error
              ? (error as { message: string }).message
              : RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }

  async adminLogout(
    req: Request,
    res: Response<AdminLogoutResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      const response: AdminLogoutResponseDTO = {
        message: RESPONSE_MESSAGES.LOGOUT_SUCCESS("Admin"),
      };

      AdminLogoutResponseSchema.parse(response);

      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Admin logout error:", error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
}
