
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AdminService } from "../services/admin.service";
import { IBrand } from "../models/brand.model";




@injectable()
export class AdminController {
    constructor(
      @inject(AdminService) private adminService:AdminService,
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
      
      async addBrand(req:Request,res:Response):Promise<void>{
        try {
          let {brandName,imageUrl} = req.body;
           brandName = brandName[0].toUpperCase()+brandName.slice(1).toLowerCase();
          const newBrand = await this.adminService.addBrand(brandName,imageUrl);
          res.status(201).json({
            success: true,
            message: `Brand ${newBrand.brandName} is created`,
            brand: newBrand,
          });
        } catch (error) {
          res.status(400).json({message:(error as Error).message})
        }
      }
      
      async getBrands(req:Request,res:Response):Promise<void>{
      try {
        const brands = await this.adminService.getBrands();
        res.status(200).json({
          success: true,
          message: `Brands fetched successfully`,
          brand: brands
      })
      } catch (error) {
        res.status(400).json({message:(error as Error).message})

      }
      }

      async addModel(req:Request,res:Response):Promise<void>{
        try {

          let {model,imageUrl,brandId} = req.body;
          console.log('the body from the add model function from the admin controller function ',req.body);
           model = model[0].toUpperCase()+model.slice(1).toLowerCase();
          const newModel = await this.adminService.addModel(model,imageUrl,brandId);
          res.status(201).json({
            success: true,
            message: `Model ${newModel.name} is created`,
            model: newModel,
          });
        } catch (error) {
          res.status(400).json({message:(error as Error).message})
        }
      }
      async toggleBrandStatus(req:Request,res:Response):Promise<void> {
        try {
          const {brandId,newStatus} = req.body;
          const updatedBrand = await this.adminService.toggleBrandStatus(brandId,newStatus);
          if (!updatedBrand) {
            res.status(404).json({
              success: false,
              message: 'Brand not found or failed to update status',
            });
            return;
          }
      
        
          res.status(200).json({
            success:true,
            message:`brand ${updatedBrand?.brandName} status changed into ${updatedBrand?.status}`,
            brand:updatedBrand
          })
        } catch (error) {
          res.status(400).json({message:(error as Error).message});
        }
      }

      async updateBrand(req: Request, res: Response): Promise<void> {
        try {
          console.log('the update brand function from the backend fired');
          const { id, name, imageUrl } = req.body;
      
          if (!id || !name || !imageUrl) {
            res.status(400).json({ message: "Missing required fields" });
            return;
          }
      
          const updatedBrand = await this.adminService.updateBrand(id,name,imageUrl);
      
          if (!updatedBrand) {
            res.status(404).json({ message: "Brand not found" });
            return;
          }
      
          res.status(200).json({ message: "Brand updated successfully", brand: updatedBrand });
      
        } catch (error) {
          console.error("Error updating brand:", error);
          res.status(500).json({ message: "Internal server error" });
        }
      }
      
    

}