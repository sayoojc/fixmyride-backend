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

@injectable()
export class UserServicePackageController
  implements IUserServicePackageController
{
  constructor(
    @inject(TYPES.UserServicePackageService)
    private readonly userServicePackageService: IUserServicePackageService
  ) {}

  async getServicePackages(
    req: Request,
    res: Response<GetServicePackagesResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      console.log("the getservice packages controller function ", req.query);
      const { vehicleId, serviceCategory, fuelType } = req.query;
      
      if (
        typeof vehicleId !== "string" ||
        typeof serviceCategory !== "string" ||
        typeof fuelType !== "string"
      ) {
        console.log("the type of the queries not correct");
        res.status(400).json({
          success: false,
          message:
            "Missing or invalid query parameters: vehicleId or serviceCategoryId",
        });
        return;
      }
      const servicePackages =
        await this.userServicePackageService.getServicePackages(
          vehicleId,
          serviceCategory,
          fuelType
        );
      console.log(
        "the service packages returned from teh service function consoled in the controller",
        servicePackages
      );
      const response = {
        success: true,
        message: "Service packages fetched successfully",
        servicePackages,
      };
      const validate = GetServicePackagesResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log(
          "the response dto is not getting validated for hte get Service packages",
          validate.error
        );
        res.status(400).json({
          success: false,
          message: "The response dto doesnt match",
        });
        return;
      }
      res.status(200).json(response);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: (error as Error).message });
    }
  }
}
