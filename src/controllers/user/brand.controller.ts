import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { UserBrandService } from "../../services/user/brand.service";
import { IUserBrandController } from "../../interfaces/controllers/user/IUserBrandController";
import {
  GetBrandsResponseSchema,
  GetBrandsResponseDTO,
  ErrorResponse,
} from "../../dtos/controllers/user/userBrandController.dto";

@injectable()
export class UserBrandController implements IUserBrandController {
  constructor(
    @inject(UserBrandService) private userBrandService: UserBrandService
  ) {}

  async getBrands(
    req: Request,
    res: Response<GetBrandsResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      console.log('Get brands controller function');
      const brands = await this.userBrandService.getBrands();

      // Transform brands and their models to match BrandSchema and ModelSchema
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
      console.log(response);
      // Validate the response
      const validatedResponse = GetBrandsResponseSchema.safeParse(response);
      if (!validatedResponse.success) {
        console.error("Response validation error:", validatedResponse.error);
        res.status(500).json({
          success: false,
          message: "Response validation failed: " + validatedResponse.error.message,
        });
        return;
      }

      res.status(200).json(response);
    } catch (error) {
      console.error("Error in getBrands:", error);
      res.status(500).json({
        success: false,
        message: "Server error: " + (error as Error).message,
      });
    }
  }
}