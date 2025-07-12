import { Request, Response } from "express";
import { IUserServicePackageService } from "../../interfaces/services/user/IUserServicePacakgeService";
import { TYPES } from "../../containers/types";
import { inject, injectable } from "inversify";
import { IUserServicePackageController } from "../../interfaces/controllers/user/IUserServicePackageController";
import {
  GetServicePackagesResponseDTO,
  ErrorResponse,
  GetServicePackagesResponseSchema,
} from "../../dtos/controllers/user/userServicePackage.dto";
import { StatusCode } from "../../enums/statusCode.enum";

@injectable()
export class UserServicePackageController
  implements IUserServicePackageController
{
  constructor(
    @inject(TYPES.UserServicePackageService)
    private readonly _userServicePackageService: IUserServicePackageService
  ) {}

  async getServicePackages(
    req: Request,
    res: Response<GetServicePackagesResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const { vehicleId, serviceCategory, fuelType } = req.query;
      
      if (
        typeof vehicleId !== "string" ||
        typeof serviceCategory !== "string" ||
        typeof fuelType !== "string"
      ) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message:
            "Missing or invalid query parameters: vehicleId or serviceCategoryId",
        });
        return;
      }
      const servicePackages =
        await this._userServicePackageService.getServicePackages(
          vehicleId,
          serviceCategory,
          fuelType
        );

      const response = {
        success: true,
        message: "Service packages fetched successfully",
        servicePackages,
      };
      const validate = GetServicePackagesResponseSchema.safeParse(response);
      if (!validate.success) {
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
}
