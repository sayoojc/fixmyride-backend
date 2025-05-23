import { Request, Response } from "express";
import {UpdateProfileResponseDTO,UpdateProfileRequestDTO,ErrorResponse} from '../../../dtos/controllers/provider/providerProfile.controller.dto'
export interface IProviderProfileController {
  getProfileData(req: Request, res: Response): Promise<void>;
  verifyProvider(req: Request, res: Response): Promise<void>;
  updateProfile(
    req: Request<{}, {}, UpdateProfileRequestDTO>,
    res: Response<UpdateProfileResponseDTO | ErrorResponse>
  ): Promise<void>;
}
