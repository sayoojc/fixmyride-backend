import { Request, Response } from "express";

export interface IUserProfileController {
  getProfileData(req: Request, res: Response): Promise<void>;
  updateProfile(req: Request, res: Response): Promise<void>;
  changePassword(req: Request, res: Response): Promise<void>;
}
