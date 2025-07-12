import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IAdminBrandService } from "../../interfaces/services/admin/IAdminBrandService";
import { TYPES } from "../../containers/types";
import { IAdminBrandController } from "../../interfaces/controllers/admin/IAdminBrandController";
import { StatusCode } from "../../enums/statusCode.enum";
type AddBrandResponse = AddBrandResponseDTO | { message: string; errors?: any };
type GetBrandsResponse =
  | GetBrandsResponseDTO
  | { message: string; errors?: any };
type UpdateBrandResponse =
  | UpdateBrandResponseDTO
  | { message: string; errors?: any };
import {
  AddBrandRequestDTO,
  AddBrandRequestSchema,
  AddBrandResponseDTO,
  AddBrandResponseSchema,
  GetBrandsResponseSchema,
  GetBrandsResponseDTO,
  ToggleBrandStatusRequestDTO,
  ToggleBrandStatusRequestSchema,
  ToggleBrandStatusResponseDTO,
  ToggleBrandStatusResponseSchema,
  UpdateBrandRequestDTO,
  UpdateBrandResponseDTO,
  UpdateBrandRequestSchema,
  BrandSchema,
  UpdateBrandResponseSchema,
} from "../../dtos/controllers/admin/adminBrand.controller.dto";
@injectable()
export class AdminBrandController implements IAdminBrandController {
  constructor(
    @inject(TYPES.AdminBrandService)
    private readonly _adminBrandService: IAdminBrandService
  ) {}

  async addBrand(
    req: Request<{}, {}, AddBrandRequestDTO>,
    res: Response<AddBrandResponse>
  ): Promise<void> {
    try {
      const parsed = AddBrandRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          message: "Invalid input",
          errors: parsed.error.flatten(),
        });
        return;
      }
      let { brandName, imageUrl } = parsed.data;
      brandName = brandName[0].toUpperCase() + brandName.slice(1).toLowerCase();
      const newBrand = await this._adminBrandService.addBrand(
        brandName,
        imageUrl
      );
      const formattedBrand = {
        _id: newBrand._id.toString(),
        brandName: newBrand.brandName,
        imageUrl: newBrand.imageUrl,
        status: newBrand.status,
      };

      const response: AddBrandResponseDTO = {
        message: `Brand ${newBrand.brandName} is created`,
        success: true,
        brand: formattedBrand,
      };
      const validated = AddBrandResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO does not match schema");
      }
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
    }
  }

  async getBrands(
    req: Request,
    res: Response<GetBrandsResponse >
  ): Promise<void> {
    try {
          const search = req.query.search?.toString() || "";
    const page = parseInt(req.query.page as string) ;
    const statusFilter = req.query.statusFilter?.toString() || "all";
if(page < 0){
  const brandsWithModels = await this._adminBrandService.getAllBrands()
      const formattedBrands = brandsWithModels.map((brand) => ({
        _id: brand._id.toString(),
        brandName: brand.brandName,
        imageUrl: brand.imageUrl,
        status: brand.status.toString(),
        models: brand.models,
      }));
         const response: GetBrandsResponseDTO = {
        success: true,
        message: "Brands fetched successfully",
        BrandObject: {formattedBrands,totalPage:0},
      };
          const validated = GetBrandsResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO does not match schema");
      }
      res.status(StatusCode.OK).json(response);
      return 
}
    const limit = 4;
    const skip = (page - 1) * limit;
        const { brandsWithModels, totalCount } = await this._adminBrandService.getBrands({
      search,
      skip,
      limit,
      statusFilter,
    });
    const totalPage = Math.max(totalCount/limit)
      const formattedBrands = brandsWithModels.map((brand) => ({
        _id: brand._id.toString(),
        brandName: brand.brandName,
        imageUrl: brand.imageUrl,
        status: brand.status.toString(),
        models: brand.models,
      }));
      const response: GetBrandsResponseDTO = {
        success: true,
        message: "Brands fetched successfully",
        BrandObject: {formattedBrands,totalPage},
      };
      const validated = GetBrandsResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO does not match schema");
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
    }
  }

  async toggleBrandStatus(
    req: Request<{}, {}, ToggleBrandStatusRequestDTO>,
    res: Response<ToggleBrandStatusResponseDTO>
  ): Promise<void> {
    try {
      const parsed = ToggleBrandStatusRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          message: "Invalid input",
          errors: parsed.error.flatten(),
        } as any);
        return;
      }
      const { brandId, newStatus } = parsed.data;

      const updatedBrand = await this._adminBrandService.toggleBrandStatus(
        brandId,
        newStatus
      );

      if (!updatedBrand) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Brand not found or failed to update status",
        });
        return;
      }
      const response: ToggleBrandStatusResponseDTO = {
        success: true,
        message: `Brand ${updatedBrand.brandName} status changed to ${updatedBrand.status}`,
        brand: {
          _id: updatedBrand._id.toString(), // Convert ObjectId to string
          brandName: updatedBrand.brandName,
          imageUrl: updatedBrand.imageUrl,
          status: updatedBrand.status.toString(), // Ensure status is string (in case it's an enum or boolean)
        },
      };
      const validated = ToggleBrandStatusResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO does not match schema");
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async updateBrand(
    req: Request<{}, {}, UpdateBrandRequestDTO>,
    res: Response<UpdateBrandResponse>
  ): Promise<void> {
    try {
      const parsed = UpdateBrandRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          message: "Invalid input",
          errors: parsed.error.flatten(),
        });
        return;
      }
      const { id, name, imageUrl } = parsed.data;
      const updatedBrand = await this._adminBrandService.updateBrand(
        id,
        name,
        imageUrl
      );

      if (!updatedBrand) {
        res.status(StatusCode.NOT_FOUND).json({ message: "Brand not found" });
        return;
      }
      const brand = { ...updatedBrand, _id: updatedBrand._id.toString() };
      const response: UpdateBrandResponseDTO = {
        message: "Brand updated successfully",
        brand: brand,
      };
      const validated = UpdateBrandResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO does not match schema");
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Error updating brand:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
  }
}
