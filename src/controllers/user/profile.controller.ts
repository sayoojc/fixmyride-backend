import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserProfileService } from "../../services/user/profile.service";
import { IUserProfileController } from "../../interfaces/controllers/user/IUserProfileController";

@injectable()
export class UserProfileController implements IUserProfileController {
  constructor(
    @inject(UserProfileService) private userProfileService: UserProfileService
  ) {}

  async getProfileData(req: Request, res: Response): Promise<void> {
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

      const sanitizedUser = await this.userProfileService.getProfileData(
        user.id
      );
      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        user: sanitizedUser,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { phone, userId, userName } = req.body;
      const updatedUser = await this.userProfileService.updateProfile(
        phone,
        userId,
        userName
      );
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      const updatedUser = await this.userProfileService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      res.status(200).json({
        success: true,
        message: "password changed successfully",
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}
