import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AdminUserService } from "../../services/admin/user.service";

@injectable()
export class AdminUserController {
  constructor(
    @inject(AdminUserService) private adminUserService: AdminUserService
  ) {}

  async fetchUsers(req: Request, res: Response): Promise<void> {
    try {
      console.log('admin user controller function')
      const sanitizedUsers = await this.adminUserService.fetchUsers();
      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users: sanitizedUsers
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async toggleListing(req: Request, res: Response): Promise<void> {
    try {
      const email = req.body.email;
      const updatedUser = await this.adminUserService.toggleListing(email);
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
