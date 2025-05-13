import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AdminProviderService } from "../../services/admin/provider.service";

@injectable()
export class AdminProviderController {
  constructor(
    @inject(AdminProviderService) private adminProviderService: AdminProviderService
  ) {}

  async fetchProviders(req: Request, res: Response): Promise<void> {
    try {
      const sanitizedProviders = await this.adminProviderService.fetchProviders();
      res.status(200).json({
        success: true,
        message: "Providers fetched successfully",
        providers: sanitizedProviders
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
  async fetchVerificationData(req:Request,res:Response):Promise<void> {
    try {
        const id = req.query.id as string;
        console.log('id from teh fetch verificationdat controler fucnton',id);
        const verificationData = await this.adminProviderService.fetchVerificationData(id);
        console.log('verificationData',verificationData);
        res.status(200).json({

            success: true,
            message: "Providers fetched successfully",
            verificationData
          });
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });

    }
  }
  async fetchProviderById(req: Request, res: Response): Promise<void> {
    try {
      const providerId = req.query.id as string
      const sanitizedProvider = await this.adminProviderService.fetchProviderById(providerId);
      res.status(200).json({
        success: true,
        message: "Providers fetched successfully",
        providers: sanitizedProvider
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
  async verifyProvider(req:Request,res:Response):Promise<void> {
    try {
      const {providerId,verificationAction,adminNotes} = req.body;
      const updatedProvider = this.adminProviderService.verifyProvider(providerId,verificationAction,adminNotes);
      if(!updatedProvider){
        throw Error('Error updating the provider');
      }
      res.status(200).json({
        success:true,
        message:"provider updated successfully",
        provider:updatedProvider
      })
    } catch (error) {
      throw error
    }
  }
  async toggleListing(req: Request, res: Response): Promise<void> {
    try {
      const id = req.body.providerId;
      const updatedUser = await this.adminProviderService.toggleListing(id);
      res.status(200).json({
        success: true ,
        message: `User has been ${updatedUser?.isListed ? 'unblocked' : 'blocked'}`,
        user: updatedUser,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}
