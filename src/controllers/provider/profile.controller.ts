import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ProviderProfileService } from "../../services/provider/profile.service";


@injectable()
export class ProviderProfileController {
  constructor(@inject(ProviderProfileService) private providerProfileService: ProviderProfileService) {}

  async getProfileData(req: Request, res: Response): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res.status(401).json({ message: "Not authorized, no access token" });
      return;
    }

    try {
      const userDetails = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
      const user = userDetails as JwtPayload;

      if (!user) {
        throw new Error("Failed to Authenticate");
      }

      const sanitizedUser = await this.providerProfileService.getProfileData(user.id);
      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        provider: sanitizedUser,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
  async verifyProvider(req: Request, res: Response):Promise<void> {
    try {
      const { verificationData } = req.body;
      console.log('verificationData from the verify provider function',verificationData)
      const accessToken = req.cookies.accessToken;
      const userDetails = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
      const user = userDetails as JwtPayload;
      console.log('The user from teh verify provider controller',user)

      if (!user) {
        throw new Error("Failed to Authenticate");
      }
      // const {
      //   licenseImage,
      //   idProofImage,
      //   accountHolderName,
      //   ifscCode,
      //   accountNumber,
      //   startedYear,
      //   description,
      // } = verificationData || {};
   
        const savedData = this.providerProfileService.verifyProvider(verificationData,user.id);
   
       res.status(200).json({ success: true, message: "Validation passed (mock response)." });

    } catch (error) {
      console.error("Verification error:", error);
       res.status(500).json({ success: false, message: "Server error" });
    }
  }
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log('req.body from updateProfile', req.body);
      const updatedProfile = await this.providerProfileService.updateProfile(req.body);
  
      if (updatedProfile) {
        res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          provider: updatedProfile,
        });
      } else {
        res.status(404).json({ success: false, message: 'Provider not found' });
      }
    } catch (error) {
      console.error("Error updating provider:", error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  
}
