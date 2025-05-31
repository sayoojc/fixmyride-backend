import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AdminBrandService } from "../../services/admin/brand.service";
import { IAdminBrandController } from "../../interfaces/controllers/admin/IAdminBrandController";
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
    @inject(AdminBrandService) private adminBrandService: AdminBrandService
  ) {}

  async addBrand(
    req: Request<{}, {}, AddBrandRequestDTO>,
    res: Response<AddBrandResponse>
  ): Promise<void> {
    try {
      const parsed = AddBrandRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Invalid input",
          errors: parsed.error.flatten(),
        });
        return;
      }
      let { brandName, imageUrl } = parsed.data;
      brandName = brandName[0].toUpperCase() + brandName.slice(1).toLowerCase();
      const newBrand = await this.adminBrandService.addBrand(
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
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getBrands(
    req: Request,
    res: Response<GetBrandsResponse>
  ): Promise<void> {
    try {
      const brandsFromDB = await this.adminBrandService.getBrands();

      const formattedBrands = brandsFromDB.map((brand) => ({
        _id: brand._id.toString(),
        brandName: brand.brandName,
        imageUrl: brand.imageUrl,
        status: brand.status.toString(),
        models:brand.models
      }));
      const response: GetBrandsResponseDTO = {
        success: true,
        message: "Brands fetched successfully",
        brand: formattedBrands,
      };
      const validated = GetBrandsResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO does not match schema");
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async toggleBrandStatus(
    req: Request<{}, {}, ToggleBrandStatusRequestDTO>,
    res: Response<ToggleBrandStatusResponseDTO>
  ): Promise<void> {
    try {
      const parsesd = ToggleBrandStatusRequestSchema.safeParse(req.body);
      if (!parsesd.success) {
        res.status(400).json({
          message: "Invalid input",
          errors: parsesd.error.flatten(),
        } as any);
        return;
      }
      const { brandId, newStatus } = parsesd.data;

      const updatedBrand = await this.adminBrandService.toggleBrandStatus(
        brandId,
        newStatus
      );

      if (!updatedBrand) {
        res.status(404).json({
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
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
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
        res.status(400).json({
          message: "Invalid input",
          errors: parsed.error.flatten(),
        });
        return;
      }
      const { id, name, imageUrl } = parsed.data;
      const updatedBrand = await this.adminBrandService.updateBrand(
        id,
        name,
        imageUrl
      );

      if (!updatedBrand) {
        res.status(404).json({ message: "Brand not found" });
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
      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating brand:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
