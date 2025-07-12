import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IProviderAuthService } from "../../interfaces/services/provider/IproviderAuthService";
import { IMailService } from "../../interfaces/services/IMailService";
import { TYPES } from "../../containers/types";
import { MailService } from "../../services/mail.service";
import { authenticator } from "otplib";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import { IProviderAuthController } from "../../interfaces/controllers/provider/IProviderAuthController";
import {
  ProviderRegisterTempSchema,
  ProviderRegisterSchema,
  ProviderLoginSchema,
  ProviderRegisterTempDTO,
  ProviderRegisterDTO,
  ProviderLoginDTO,
  ErrorResponse,
  SuccessMessageDTO,
  ProviderLoginResponseDTO,
} from "../../dtos/controllers/provider/providerAuth.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";

@injectable()
export class ProviderAuthController implements IProviderAuthController {
  constructor(
    @inject(TYPES.ProviderAuthService)
    private _providerAuthService: IProviderAuthService,
    @inject(TYPES.MailService) private _mailService: IMailService
  ) {}
  async providerRegisterTemp(
    req: Request<{}, {}, ProviderRegisterTempDTO>,
    res: Response<SuccessMessageDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ProviderRegisterTempSchema.safeParse(req.body);
      if (!parsed.success) throw new Error("Invalid provider data");

      const data = parsed.data;
      const secret = authenticator.generateSecret();
      const otp = authenticator.generate(secret);
      const tempUser = await this._providerAuthService.providerRegisterTemp({
        ...data,
        otp,
      });
      if (!tempUser) {
        throw new Error("Temporary user creation is failed");
      }
      await this._mailService.sendWelcomeEmail(
        data.email,
        "Sign up OTP",
        `Welcome to FixMyRide. Your OTP is ${otp}`
      );

      res.status(StatusCode.CREATED).json({ success: true, message: "OTP sent" });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
    }
  }

  async providerRegister(
    req: Request<{}, {}, ProviderRegisterDTO>,
    res: Response<SuccessMessageDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ProviderRegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new Error("Invalid provider registration data");
      }

      const provider = await this._providerAuthService.providerRegister({
        ...parsed.data,
      });

      if (!provider) {
        throw new Error("User registration failed");
      }

      res
        .status(StatusCode.CREATED)
        .json({ success: true, message: "Provider registered successfully" });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
    }
  }

  async providerLogin(
    req: Request<{}, {}, ProviderLoginDTO>,
    res: Response<ProviderLoginResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ProviderLoginSchema.safeParse(req.body);
      if (!parsed.success) throw new Error("Invalid login credentials");

      const { email, password } = parsed.data;

      const { sanitizedProvider, accessToken, refreshToken } =
        await this._providerAuthService.providerLogin(email, password);

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
        .json({ message: "Login successful", user: sanitizedProvider });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: error.message });
      } else if (error instanceof Error) {
        res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
      }
    }
  }
  async providerLogout(
    req: Request,
    res: Response<SuccessMessageDTO | ErrorResponse>
  ) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(StatusCode.OK).json({ message: "Provider logged out successfully" });
    } catch (error) {
      console.error("Provider logout error:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to logout" });
    }
  }
}
