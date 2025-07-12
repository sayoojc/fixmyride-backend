import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import {TYPES} from '../../containers/types'
import { IUserAuthService } from "../../interfaces/services/user/IUserAuthService";
import { IMailService } from "../../interfaces/services/IMailService";
import { authenticator } from "otplib";
import { NotFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import {
  RegisterTempRequestSchema,
  RegisterRequestSchema,
  LoginRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  RegisterTempResponseSchema,
  RegisterResponseSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordResponseSchema,
  RegisterTempRequestDTO,
  RegisterRequestDTO,
  LoginRequestDTO,
  ForgotPasswordRequestDTO,
  ResetPasswordRequestDTO,
  RegisterTempResponseDTO,
  RegisterResponseDTO,
  LoginResponseDTO,
  LogoutResponseDTO,
  ForgotPasswordResponseDTO,
  ResetPasswordResponseDTO,
  ErrorResponse,
} from "../../dtos/controllers/user/userAuth.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";


@injectable()
export class UserAuthController {
  constructor(
    @inject(TYPES.UserAuthService) private readonly _userAuthService: IUserAuthService,
    @inject(TYPES.MailService) private readonly _mailService: IMailService,
  ) {}

  /**
   * @desc    Temporarily registers a user and sends an OTP via email
   * @route   POST /register-temp
   * @access  Public
   */
  async registerTemp(req: Request<{},{},RegisterTempRequestDTO>, res: Response<RegisterTempResponseDTO | ErrorResponse>): Promise<void> {
    try {
 const parsed = RegisterTempRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid input: " + parsed.error.message,
        });
        return;
      }

      const { name, email, phone, password } = parsed.data;      const secret = authenticator.generateSecret();
      const otp = authenticator.generate(secret);
      console.log(`OTP: ${otp}, Secret: ${secret}`);
      const tempUser = await this._userAuthService.registerTempUser({
        name,
        email,
        phone,
        password,
        otp,
      });

      await this._mailService.sendWelcomeEmail(
        email,
        "Sign up OTP",
        `Welcome to FixMyRide. Your OTP is ${otp}`
      );
      const response: RegisterTempResponseDTO = {
        success: true,
        message: "OTP sent",
        email: tempUser.email,
      };

      const validatedResponse = RegisterTempResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Response validation failed: " + validatedResponse.error.message,
        });
        return;
      }

      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
  res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });    }
  }

  /**
   * @desc    Registers a user permanently after OTP verification
   * @route   POST /signup
   * @access  Public
   */
  async register(req: Request<{},{},RegisterRequestDTO>, res: Response<RegisterResponseDTO | ErrorResponse>): Promise<void> {
    try {
 const parsed = RegisterRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid input: " + parsed.error.message,
        });
        return;
      }

      const { otpValue, email, phone } = parsed.data;      // Register user after OTP validation
      const { user, accessToken, refreshToken } =
        await this._userAuthService.registerUser(otpValue, email, phone);
  const response: RegisterResponseDTO = {
        message: "User registered successfully",
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone ?? '',
        },
      };

      const validatedResponse = RegisterResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Response validation failed: " + validatedResponse.error.message,
        });
        return;
      }
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

    res.status(StatusCode.CREATED).json(response);
    } catch (error) {
  res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });    }
  }

  /**
   * @desc    Handles user login and verifies credentials
   * @route   POST /login
   * @access  Public
   */
  async userLogin(req: Request<{},{},LoginRequestDTO>, res: Response<LoginResponseDTO | ErrorResponse>): Promise<void> {
    try {
         const parsed = LoginRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid input: " + parsed.error.message,
        });
        return;
      }
       const { email, password } = parsed.data;
      const { user, accessToken, refreshToken } =
        await this._userAuthService.userLogin(email, password);

      const { password: userPassword, ...userWithoutPassword } =
        user.toObject();
        const response: LoginResponseDTO = {
        message: "Login successful",
        user: {
          _id: userWithoutPassword._id.toString(),
          name: userWithoutPassword.name,
          email: userWithoutPassword.email,
          phone: userWithoutPassword.phone,
        },
      };

      const validatedResponse = LoginResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Response validation failed: " + validatedResponse.error.message,
        });
        return;
      }

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

      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Error during login:", error);

      if (
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError
      ) {
        res.status(error.statusCode || StatusCode.UNAUTHORIZED).json({success:false, message: error.message });
        return;
      }

      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({success:false, message: "Server error" });
      return;
    }
  }
  async logout(req: Request, res: Response<LogoutResponseDTO | ErrorResponse>) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
       const response: LogoutResponseDTO = {
        message: "User logged out successfully",
      };
    const validatedResponse = LogoutResponseSchema.safeParse(response);

  if (!validatedResponse.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Response validation failed: " + validatedResponse.error.message,
        });
        return;
      }

      res.status(StatusCode.OK).json(response);    } catch (error) {
      console.error("Logout error:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({success: false, message: "Failed to logout" });
    }
  }
  async forgotPassword(req: Request<{},{},ForgotPasswordRequestDTO>, res: Response<ForgotPasswordResponseDTO | ErrorResponse>): Promise<void> {
    try {
        const parsed = ForgotPasswordRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid input: " + parsed.error.message,
        });
        return;
      }

      const { email } = parsed.data;
      const { user, token } = await this._userAuthService.forgotPassword(email);

      if (user) {
        const resetUrl = `${process.env.PASSWORD_RESET_URL}${token}`;

        await this._mailService.sendWelcomeEmail(
          email,
          "Reset your password",
          `
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        `
        );
      }

     const response: ForgotPasswordResponseDTO = {
        success: true,
        message: "If email exists, a reset link has been sent",
      };

      const validatedResponse = ForgotPasswordResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Response validation failed: " + validatedResponse.error.message,
        });
        return;
      }

      res.status(StatusCode.OK).json(response);
    } catch (error) {
       res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async resetPassword(req: Request<{},{},ResetPasswordRequestDTO>, res: Response<ResetPasswordResponseDTO | ErrorResponse>): Promise<void> {
    try {
     const parsed = ResetPasswordRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid input: " + parsed.error.message,
        });
        return;
      }

      const { token, password } = parsed.data;
      await this._userAuthService.resetPassword(token, password);
        const response: ResetPasswordResponseDTO = {
        message: "Password reset successful",
      };

      const validatedResponse = ResetPasswordResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Response validation failed: " + validatedResponse.error.message,
        });
        return;
      }

      res.status(StatusCode.OK).json(response);
    } catch (error) {
  res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });    }
  }
}
