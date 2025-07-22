import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUserProfileService } from "../../interfaces/services/user/IUserProfileService";
import { IUserProfileController } from "../../interfaces/controllers/user/IUserProfileController";
import {
  UpdateProfileRequestSchema,
  ChangePasswordRequestSchema,
  GetProfileResponseSchema,
  UpdateProfileResponseSchema,
  UpdateProfileRequestDTO,
  ChangePasswordRequestDTO,
  GetProfileResponseDTO,
  UpdateProfileResponseDTO,
  ChangePasswordResponseDTO,
  ErrorResponse,
} from "../../dtos/controllers/user/userProfile.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
@injectable()
export class UserProfileController implements IUserProfileController {
  constructor(
    @inject(TYPES.UserProfileService)
    private _userProfileService: IUserProfileService
  ) {}

  async getProfileData(
    req: Request,
    res: Response<GetProfileResponseDTO | ErrorResponse>
  ): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    try {
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user || !user.id) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const sanitizedUser = await this._userProfileService.getProfileData(
        user.id
      );
      if (!sanitizedUser) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      const transformedUser = {
        id: sanitizedUser.id,
        name: sanitizedUser.name,
        email: sanitizedUser.email,
        phone: sanitizedUser.phone,
        role: sanitizedUser.role,
        isListed: sanitizedUser.isListed,
        provider: sanitizedUser.provider,
        addresses: sanitizedUser.addresses.map((address) => ({
          id: address.id.toString(),
          userId: address.userId.toString(),
          addressType: address.addressType,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          isDefault: address.isDefault,
        })),
        defaultAddress: sanitizedUser.defaultAddress,
        vehicles: sanitizedUser.vehicles.map((vehicle) => ({
          _id: vehicle._id.toString(),
          userId: vehicle.userId.toString(),
          brandId: {
            _id: vehicle.brandId._id.toString(),
            brandName: vehicle.brandId.brandName,
            imgeUrl: vehicle.brandId.imageUrl,
            status: vehicle.brandId.status,
          },
          modelId: {
            _id: vehicle.modelId._id.toString(),
            name: vehicle.modelId.name,
            imageUrl: vehicle.modelId.imageUrl,
            status: vehicle.modelId.status,
            brandId: vehicle.modelId.brandId.toString(),
            fuelTypes: vehicle.modelId.fuelTypes,
          },
          year: vehicle.year,
          isDefault: vehicle.isDefault,
          registrationNumber: vehicle.registrationNumber,
          fuel: vehicle.fuel,
        })),
      };

      const response: GetProfileResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Profile"),
        user: transformedUser,
      };
      const validatedResponse = GetProfileResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }

      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
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
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.UNAUTHORIZED,
      });
      return;
    }
         const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user || !user.id) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const parsed = UpdateProfileRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const { phone,userName } = parsed.data;
      const updatedUser = await this._userProfileService.updateProfile(
        phone,
        user.id,
        userName
      );
      if (!updatedUser) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      const response: UpdateProfileResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Profile"),
        user: updatedUser,
      };
      const validatedResponse = UpdateProfileResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async changePassword(
    req: Request<{}, {}, ChangePasswordRequestDTO>,
    res: Response<ChangePasswordResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.UNAUTHORIZED,
      });
      return;
    }
         const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user || !user.id) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const parsed = ChangePasswordRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const {currentPassword, newPassword } = parsed.data;
      const updatedUser = await this._userProfileService.changePassword(
        user.id,
        currentPassword,
        newPassword
      );
      if (!updatedUser) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Password"),
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
