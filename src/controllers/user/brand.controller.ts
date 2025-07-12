import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import {TYPES} from "../../containers/types";
import { IUserBrandService } from "../../interfaces/services/user/IUserBrandService";
import { IUserBrandController } from "../../interfaces/controllers/user/IUserBrandController";
import {
  GetBrandsResponseSchema,
  GetBrandsResponseDTO,
  ErrorResponse,
} from "../../dtos/controllers/user/userBrandController.dto";
import { StatusCode } from "../../enums/statusCode.enum";

@injectable()
export class UserBrandController implements IUserBrandController {
  constructor(
    @inject(TYPES.UserBrandService) private readonly _userBrandService: IUserBrandService
  ) {}

  async getBrands(
    req: Request,
    res: Response<GetBrandsResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const brands = await this._userBrandService.getBrands();
      const transformedBrands = brands.map((brand) => ({
        _id: brand._id.toString(),
        brandName: brand.brandName,
        imageUrl: brand.imageUrl,
        status: brand.status,
        models: brand.models.map((model) => ({
          _id: model._id.toString(),
          name: model.name,
          imageUrl: model.imageUrl,
          status: model.status,
          brandId: model.brandId.toString(),
          fuelTypes: model.fuelTypes,
         
        })),
      }));

      const response: GetBrandsResponseDTO = {
        success: true,
        message: "Brands fetched successfully",
        brands: transformedBrands,
      };
      const validatedResponse = GetBrandsResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        console.error("Response validation error:", validatedResponse.error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Response validation failed: " + validatedResponse.error.message,
        });
        return;
      }

      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Error in getBrands:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Server error: " + (error as Error).message,
      });
    }
  }
}