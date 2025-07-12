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
        message: "Not authorized, no access token",
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
        throw new Error("Failed to authenticate");
      }

      const sanitizedUser = await this._userProfileService.getProfileData(
        user.id
      );
      if (!sanitizedUser) {
        throw new Error("User profile not found");
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
        message: "User fetched successfully",
        user: transformedUser,
      };

      // Validate the response
      const validatedResponse = GetProfileResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        console.error(
          "Response validation error from get profile data:",
          validatedResponse.error
        );
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message:
            "Response validation failed: " + validatedResponse.error.message,
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
  async updateProfile(
    req: Request<{}, {}, UpdateProfileRequestDTO>,
    res: Response<UpdateProfileResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = UpdateProfileRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid input " + parsed.error.message,
        });
        return;
      }
      const { phone, userId, userName } = parsed.data;
      const updatedUser = await this._userProfileService.updateProfile(
        phone,
        userId,
        userName
      );
      if (!updatedUser) {
        throw new Error("Failed to update user profile");
      }
      const response: UpdateProfileResponseDTO = {
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      };
      const validatedResponse = UpdateProfileResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        console.error("Response validation error:", validatedResponse.error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message:
            "Response validation failed: " + validatedResponse.error.message,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Error in updateProfile:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
  async changePassword(
    req: Request<{}, {}, ChangePasswordRequestDTO>,
    res: Response<ChangePasswordResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ChangePasswordRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid input",
        });
        return;
      }
      const { userId, currentPassword, newPassword } = parsed.data;
      const updatedUser = await this._userProfileService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      if (!updatedUser) {
        throw new Error("Failed to change password");
      }
      res.status(StatusCode.OK).json({
        success: true,
        message: "password changed successfully",
      });
    } catch (error) {
      console.error("Error in changePassword:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}
