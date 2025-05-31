import { Request, Response } from "express";
import {
  AddServicePackageRequestDTO,
  AddServicePackageResponseDTO,
  GetServicePackagesResponseDTO,
  ErrorResponse,
} from "../../../dtos/controllers/admin/adminServicePackageController.dto";
export interface IAdminServicePackageController {
  addServicePackage(
    req: Request<{}, {}, AddServicePackageRequestDTO>,
    res: Response<AddServicePackageResponseDTO | ErrorResponse>
  ): Promise<void>;
  getServicePackages(
    req: Request,
    res: Response<GetServicePackagesResponseDTO | ErrorResponse>
  ): Promise<void>;
}
