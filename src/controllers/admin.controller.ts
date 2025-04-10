
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { UserRepository } from "../repositories/user.repo";
import { AdminService } from "../services/admin.service";


@injectable()
export class AdminController {
    constructor(
      @inject(AdminService) private adminService:AdminService,
      @inject(UserRepository) private userRepository:UserRepository,
    ){}

    async fetchUsers(req:Request,res:Response):Promise<void> {

        try {
          const sanitizedUsers = await this.adminService.fetchUsers();
          res.status(200).json({ 
            success: true, 
            message: "users fetched successfully",
            users:sanitizedUsers
          });
    
        } catch (error) {
          res.status(400).json({message:(error as Error).message})
        }
      }
    
      async toggleListing (req:Request,res:Response):Promise<void> {
          try {
            const email = req.body.email;
    console.log('The email from the toggle listing function ',email);
           const updatedUser = await this.adminService.toggleListing(email);
           console.log('The updated user',updatedUser)
            res.status(200).json({
              success: true,
              message: `User has been ${updatedUser?.isListed ? 'unblocked' : 'blocked'}`,
              user: updatedUser,
            });
          } catch (error) {
            res.status(400).json({message:(error as Error).message})
          }
      }
    

}