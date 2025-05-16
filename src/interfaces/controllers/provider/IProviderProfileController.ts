import { Request, Response } from "express";

export interface IProviderProfileController {
  getProfileData(req: Request, res: Response): Promise<void>;
  verifyProvider(req: Request, res: Response): Promise<void>;
  updateProfile(req: Request, res: Response): Promise<void>;
}
