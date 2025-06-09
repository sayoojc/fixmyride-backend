import { Request, Response } from "express";
import {
  AddServicePackageRequestDTO,
  AddServicePackageResponseDTO,
  GetServicePackagesResponseDTO,
  UpdateServicePackageRequestDTO,
  UpdateServicePackageResponseDTO,
  ToggleBlockStatusRequestDTO,
  ToggleBlockStatusResponseDTO,
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
  updateServicePackage(
    req:Request<{},{},UpdateServicePackageRequestDTO>,
    res:Response<UpdateServicePackageResponseDTO | ErrorResponse>
  ):Promise<void>
  toggleBlockStatus(
    req:Request<{},{},ToggleBlockStatusRequestDTO>,
    res:Response<ToggleBlockStatusResponseDTO | ErrorResponse>
  ):Promise<void>
}
