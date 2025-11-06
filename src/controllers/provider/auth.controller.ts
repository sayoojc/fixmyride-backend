import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IProviderAuthService } from "../../interfaces/services/provider/IproviderAuthService";
import { IMailService } from "../../interfaces/services/IMailService";
import { TYPES } from "../../containers/types";
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
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

@injectable()
export class ProviderAuthController implements IProviderAuthController {
  constructor(
    @inject(TYPES.ProviderAuthService)
    private readonly _providerAuthService: IProviderAuthService,
    @inject(TYPES.MailService) private readonly _mailService: IMailService
  ) {}
  async providerRegisterTemp(
    req: Request<{}, {}, ProviderRegisterTempDTO>,
    res: Response<SuccessMessageDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ProviderRegisterTempSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }

      const data = parsed.data;
      const secret = authenticator.generateSecret();
      const otp = authenticator.generate(secret);
      const tempUser = await this._providerAuthService.providerRegisterTemp({
        ...data,
        otp,
      });
      if (!tempUser) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      await this._mailService.sendWelcomeEmail(
        data.email,
        "Sign up OTP",
        `Welcome to FixMyRide. Your OTP is ${otp}`
      );

      res.status(StatusCode.CREATED).json({
        success: true,
        message: RESPONSE_MESSAGES.OTP_SEND_SUCCESSFULLY,
      });
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  async providerRegister(
    req: Request<{}, {}, ProviderRegisterDTO>,
    res: Response<SuccessMessageDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ProviderRegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const provider = await this._providerAuthService.providerRegister({
        ...parsed.data,
      });
      if (!provider) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.CREATED).json({
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_CREATED("Provider"),
      });
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: (error as Error).message });
    }
  }

  async providerLogin(
    req: Request<{}, {}, ProviderLoginDTO>,
    res: Response<ProviderLoginResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      console.log('the provider login controller function');
      const parsed = ProviderLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log('the request parsing failed',parsed.error.message);
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const { email, password } = parsed.data;
      const { sanitizedProvider, accessToken, refreshToken } =
        await this._providerAuthService.providerLogin(email, password);

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

      res.status(StatusCode.OK).json({
        message: RESPONSE_MESSAGES.LOGIN_SUCCESS("Provider"),
        user: sanitizedProvider,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async providerLogout(
    req: Request,
    res: Response<SuccessMessageDTO | ErrorResponse>
  ) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res
        .status(StatusCode.OK)
        .json({ message: RESPONSE_MESSAGES.LOGOUT_SUCCESS("Provider") });
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: RESPONSE_MESSAGES.LOGOUT_FAILED });
    }
  }
}
