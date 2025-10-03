import { Request, Response } from "express";
import {
  GetServicePackageByIdResponseDTO,
  ErrorResponse,
  GetServicePackagesResponseDTO,
} from "../../../dtos/controllers/user/userServicePackage.dto";

export interface IUserServicePackageController {
  getServicePackages(
    req: Request,
    res: Response<GetServicePackagesResponseDTO | ErrorResponse>
  ): Promise<void>;
  getServicePackageById(
    req: Request,
    res: Response<GetServicePackageByIdResponseDTO | ErrorResponse>
  ): Promise<void>;
}
