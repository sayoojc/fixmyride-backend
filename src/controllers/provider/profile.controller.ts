import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import {TYPES} from '../../containers/types'
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
  SuccessMessageDTO,
  GetProfileDataResponseSchema,
  VerifyProviderRequestDTO,
  VerifyProviderResponseSchema,
  UpdateProfileRequestDTO,
} from "../../dtos/controllers/provider/providerProfile.controller.dto";

@injectable()
export class ProviderProfileController implements IProviderProfileController {
  constructor(
    @inject(TYPES.ProviderProfileService)
    private readonly providerProfileService: IProviderProfileService
  ) {}

  async getProfileData(
    req: Request,
    res: Response<GetProfileDataResponseDTO | ErrorResponse>
  ): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res.status(401).json({ message: "Not authorized, no access token" });
      return;
    }

    try {
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user) {
        throw new Error("Failed to Authenticate");
      }

      const sanitizedUser = await this.providerProfileService.getProfileData(
        user.id
      );
      if (!sanitizedUser) {
        res.status(404).json({ message: "Provider not found" });
        return;
      }
      const response: GetProfileDataResponseDTO = {
        success: true,
        message: "User fetched successfully",
        provider: sanitizedUser,
      };
      const validated = GetProfileDataResponseSchema.safeParse(response);
      if (!validated.success) {
        console.error("Zod validation failed", validated.error);
        throw new Error("Response DTO validation failed");
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
  async verifyProvider(
    req: Request<VerifyProviderRequestDTO>,
    res: Response<VerifyProviderResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = VerifyProviderRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new Error("The request dto doesnt match");
      }
      const { verificationData } = parsed.data;
      const accessToken = req.cookies.accessToken;
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user) {
        throw new Error("Failed to Authenticate");
      }

      const savedData = this.providerProfileService.verifyProvider(
        verificationData,
        user.id
      );
      const response: VerifyProviderResponseDTO = {
        success: true,
        message: "Provider verified successfully.",
      };
      const validated = VerifyProviderResponseSchema.safeParse(response);

      if (!validated.success) {
        console.error("Zod validation error", validated.error);
        throw new Error("Response DTO does not match schema");
      }
      res.status(200).json(response);
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateProfile(
    req: Request<{},{},UpdateProfileRequestDTO>,
    res: Response<UpdateProfileResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
       console.log('req.body',req.body);
      const parsed = UpdateProfileRequestSchema.safeParse(req.body)
      console.log('The parsed update profile request schema',parsed);
      if (!parsed.success) {
        console.log('The error in parsing the data ',parsed.error.message);
        throw new Error("The request dto doesnt match");
      }
     
      const updatedProfile = await this.providerProfileService.updateProfile(
        parsed.data
      );

      if (updatedProfile) {
        res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          provider: {
            ...updatedProfile,
            phone: updatedProfile.phone ?? "",
            _id: updatedProfile._id.toString(),
            address: updatedProfile.address
              ? `${updatedProfile.address.street}, ${updatedProfile.address.city}, ${updatedProfile.address.state} - ${updatedProfile.address.pinCode}`
              : undefined,
          },
        });
      } else {
        res.status(404).json({ success: false, message: "Provider not found" });
      }
    } catch (error) {
      console.error("Error updating provider:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}


