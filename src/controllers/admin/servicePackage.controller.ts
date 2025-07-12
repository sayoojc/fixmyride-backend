import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IAdminServicePackageController } from "../../interfaces/controllers/admin/IAdminServicePackageController";
import { IAdminServicePackageService } from "../../interfaces/services/admin/IAdminServicePackageService";
import { TYPES } from "../../containers/types";
import { StatusCode } from "../../enums/statusCode.enum";
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
  UpdateServicePackageResponseSchema,
} from "../../dtos/controllers/admin/adminServicePackageController.dto";
@injectable()
export class AdminServicePackageController
  implements IAdminServicePackageController
{
  constructor(
    @inject(TYPES.AdminServicePackageService)
    private readonly _adminServicePackageService: IAdminServicePackageService
  ) {}
  async addServicePackage(
    req: Request<{}, {}, AddServicePackageRequestDTO>,
    res: Response<AddServicePackageResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ServicePackageSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log('the request data parsing is failed',parsed.error.message);
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid input",
        });
        return;
      }
      const newServicePackage =
        await this._adminServicePackageService.addServicePackage(parsed.data);
      const response = {
        success: true,
        message: "Service package added successfully",
        servicePackage: newServicePackage,
      };
      const validate = AddServicePackageResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log('the service package controller response dto doesnt match',validate.error.message);
        
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "response dto doesnt match",
        });
        return;
      }
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }
  async getServicePackages(
    req: Request,
    res: Response<GetServicePackagesResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const search = req.query.search?.toString() || "";
      const page = parseInt(req.query.page as string);
      const statusFilter = req.query.statusFilter?.toString() || "all";
      const fuelFilter = req.query.fuelFilter?.toString() || "";
      const limit = 4;
      const skip = (page - 1) * limit;
      const { servicePackages, totalCount } =
        await this._adminServicePackageService.getServicePackages({
          search,
          skip,
          limit,
          statusFilter,
          fuelFilter,
        });
      const response = {
        success: true,
        message: "Service packages fetched successfully",
        servicePackageResponse: { servicePackages, totalCount },
      };
      const validate = getServicePackagesResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log(
          "the response dto is not getting validated for hte get Service packages",
          validate.error
        );
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "The response dto doesnt match",
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }
 async updateServicePackage(
  req: Request<{}, {}, UpdateServicePackageRequestDTO>,
  res: Response<UpdateServicePackageResponseDTO | ErrorResponse>
): Promise<void> {
  try {
    const parsed = UpdateServicePackageRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: "Request DTO doesn't match",
      });
      return;
    }

    const updatedServicePackage = await this._adminServicePackageService.updateServicePackage(parsed.data);
    
    if (!updatedServicePackage) {
      throw new Error("The service package update failed");
    }

    const response = {
      success: true,
      message: "The service package update is successful",
      servicePackage: updatedServicePackage,
    };

    const validate = UpdateServicePackageResponseSchema.safeParse(response);
    if (!validate.success) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Response DTO doesn't match",
      });
      return;
    }

    res.status(StatusCode.OK).json(response);
  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as any).message });
  }
}

  async toggleBlockStatus(
    req: Request<{}, {}, ToggleBlockStatusRequestDTO>,
    res: Response<ToggleBlockStatusResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      console.log("the toggle block unblock controller function");
      const parsed = ToggleBlockStatusRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log("The parsing was failed");
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "The request dto doesnt match",
        });
        return;
      }
      const updatedServicePackage =
        await this._adminServicePackageService.toggleBlockStatus(parsed.data);

      const response = {
        success: true,
        message: "The toggle block unblock functionality is done successfully",
        servicePackage: updatedServicePackage,
      };
      const validate = ToggleBlockStatusResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "The response dto doesnt match",
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message });
    }
  }
}
