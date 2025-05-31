import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IAdminServicePackageController } from "../../interfaces/controllers/admin/IAdminServicePackageController";
import { AdminServicePackageService } from "../../services/admin/servicePackage.service";
function transformServicePackage(pkg: any) {
  return {
    ...pkg,
    brandId: {
      ...pkg.brandId,
      _id: pkg.brandId._id.toString(),
    },
    modelId: {
      ...pkg.modelId,
      _id: pkg.modelId._id.toString(),
      brandId: pkg.modelId.brandId.toString(),
    },
  };
}

import {
  AddServicePackageRequestDTO,
  AddServicePackageResponseDTO,
  ServicePackageSchema,
  AddServicePackageResponseSchema,
  GetServicePackagesResponseDTO,
  getServicePackagesResponseSchema,
  ErrorResponse,
  UpdateServicePackageRequestDTO,
  UpdateServicePackageResponseDTO,
  UpdateServicePackageRequestSchema,
  ToggleBlockStatusRequestDTO,
  ToggleBlockStatusResponseDTO,
  ToggleBlockStatusRequestSchema,
  ToggleBlockStatusResponseSchema,
  UpdateServicePackageResponseSchema
} from "../../dtos/controllers/admin/adminServicePackageController.dto";
@injectable()
export class AdminServicePackageController
  implements IAdminServicePackageController
{
  constructor(
    @inject(AdminServicePackageService)
    private adminServicePackageService: AdminServicePackageService
  ) {}
  async addServicePackage(
    req: Request<{}, {}, AddServicePackageRequestDTO>,
    res: Response<AddServicePackageResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ServicePackageSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: "Invalid input",
        });
        return;
      }
      const newServicePackage =
        await this.adminServicePackageService.addServicePackage(parsed.data);
      const response = {
        success: true,
        message: "Service package added successfully",
        servicePackage: newServicePackage,
      };
      const validate = AddServicePackageResponseSchema.safeParse(response);
      if (!validate) {
        res.status(400).json({
          success: false,
          message: "response dto doesnt match",
        });
      }
      res.status(201).json(response);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: (error as Error).message });
    }
  }
  async getServicePackages(
    req: Request,
    res: Response<GetServicePackagesResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const servicePackages =
        await this.adminServicePackageService.getServicePackages();
       
      const response = {
        success: true,
        message: "Service packages fetched successfully",
        servicePackages
      };
      const validate = getServicePackagesResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log(
          "the response dto is not getting validated for hte get Service packages",validate.error
        );
        res.status(400).json({
          success: false,
          message: "The response dto doesnt match",
        });
        return 
      }
      res.status(200).json(response);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: (error as Error).message });
    }
  }
  async updateServicePackage(
    req: Request<{}, {}, UpdateServicePackageRequestDTO>,
    res: Response<UpdateServicePackageResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = UpdateServicePackageRequestSchema.safeParse(req.body);
      if(!parsed.success){
        res.status(400).json({
            success:false,
            message:"request dto doesnt match"
        });
        return 
      }
         const updatedServicePackage = await this.adminServicePackageService.updateServicePackage(parsed.data);
        if(!updatedServicePackage) {
           throw new Error('The service package update failed'); 
        }
        const response = {
            success:true,
            message:'The service package update is successfull',
            servicePackage:updatedServicePackage
        }
        const validate = UpdateServicePackageResponseSchema.safeParse(response);
        if(!validate.success){
           res.status(400).json({
            success:false,
            message:"response dto doesnt match"
        });
        return 
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({success:false,message:(error as any).message})
    }
  }
  async toggleBlockStatus(
    req:Request<{},{},ToggleBlockStatusRequestDTO>,
    res:Response<ToggleBlockStatusResponseDTO | ErrorResponse>
  ):Promise<void> {
    try {
      console.log('the toggle block unblock controller function')
      const parsed = ToggleBlockStatusRequestSchema.safeParse(req.body);
      if(!parsed.success){
        console.log('The parsing was failed')
        res.status(400).json({
          success:false,
          message:"The request dto doesnt match"
        })
        return 
      }
      const updatedServicePackage = await this.adminServicePackageService.toggleBlockStatus(parsed.data);

      const response = {
        success:true,
        message:"The toggle block unblock functionality is done successfully",
        servicePackage:updatedServicePackage
      } 
      const validate = ToggleBlockStatusResponseSchema.safeParse(response);
      if(!validate.success){
        console.log('The service package response validation failed',validate.error.message);
         res.status(400).json({
          success:false,
          message:"The response dto doesnt match"
        })
        return 
      }
      res.status(200).json(response);
    } catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  res.status(400).json({ success: false, message });    }
  }
}
