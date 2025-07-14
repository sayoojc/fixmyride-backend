import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IProviderProfileService } from "../../interfaces/services/provider/IProviderProfileService";
import { IProviderProfileController } from "../../interfaces/controllers/provider/IProviderProfileController";
import {
  UpdateProfileRequestSchema,
  UpdateProfileResponseDTO,
  GetProfileDataResponseDTO,
  VerifyProviderRequestSchema,
  VerifyProviderResponseDTO,
  ErrorResponse,
  GetProfileDataResponseSchema,
  VerifyProviderRequestDTO,
  VerifyProviderResponseSchema,
  UpdateProfileRequestDTO,
} from "../../dtos/controllers/provider/providerProfile.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

@injectable()
export class ProviderProfileController implements IProviderProfileController {
  constructor(
    @inject(TYPES.ProviderProfileService)
    private readonly _providerProfileService: IProviderProfileService
  ) {}

  async getProfileData(
    req: Request,
    res: Response<GetProfileDataResponseDTO | ErrorResponse>
  ): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res
        .status(StatusCode.UNAUTHORIZED)
        .json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
      return;
    }

    try {
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user) {
        res
          .status(StatusCode.UNAUTHORIZED)
          .json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
      }

      const sanitizedUser = await this._providerProfileService.getProfileData(
        user.id
      );
      if (!sanitizedUser) {
        res
          .status(StatusCode.NOT_FOUND)
          .json({ message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("Provider") });
        return;
      }
      const response: GetProfileDataResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Provider profile"),
        provider: sanitizedUser,
      };
      const validated = GetProfileDataResponseSchema.safeParse(response);
      if (!validated.success) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: (error as Error).message });
    }
  }
  async verifyProvider(
    req: Request<VerifyProviderRequestDTO>,
    res: Response<VerifyProviderResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = VerifyProviderRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const { verificationData } = parsed.data;
      const accessToken = req.cookies.accessToken;
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user) {
        res
          .status(StatusCode.UNAUTHORIZED)
          .json({ success: false, message: RESPONSE_MESSAGES.UNAUTHORIZED });
        return;
      }

      await this._providerProfileService.verifyProvider(
        verificationData,
        user.id
      );
      const response: VerifyProviderResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.PROVIDER_VERIFIED,
      };
      const validated = VerifyProviderResponseSchema.safeParse(response);

      if (!validated.success) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }

  async updateProfile(
    req: Request<{}, {}, UpdateProfileRequestDTO>,
    res: Response<UpdateProfileResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = UpdateProfileRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const updatedProfile = await this._providerProfileService.updateProfile(
        parsed.data
      );

      if (updatedProfile) {
        res.status(StatusCode.OK).json({
          success: true,
          message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Provider"),
          provider: {
            ...updatedProfile,
            phone: updatedProfile.phone ?? "",
            _id: updatedProfile._id.toString(),
            address: updatedProfile.address
              ? `${updatedProfile.address.street}, ${updatedProfile.address.city}, ${updatedProfile.address.state} - ${updatedProfile.address.pinCode}`
              : undefined,
          },
        });
        return;
      } else {
        res
          .status(StatusCode.NOT_FOUND)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("Provider"),
          });
      }
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
}
