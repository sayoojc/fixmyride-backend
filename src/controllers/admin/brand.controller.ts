import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IAdminBrandService } from "../../interfaces/services/admin/IAdminBrandService";
import { TYPES } from "../../containers/types";
import { IAdminBrandController } from "../../interfaces/controllers/admin/IAdminBrandController";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
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
          message: RESPONSE_MESSAGES.INVALID_INPUT,
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
        message: RESPONSE_MESSAGES.RESOURCE_CREATED(newBrand.brandName),
        success: true,
        brand: formattedBrand,
      };
      const validated = AddBrandResponseSchema.safeParse(response);
      if (!validated.success) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
        return;
      }
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  async getBrands(
    req: Request,
    res: Response<GetBrandsResponse>
  ): Promise<void> {
    try {
      const search = req.query.search?.toString() || "";
      const page = parseInt(req.query.page as string);
      const statusFilter = req.query.statusFilter?.toString() || "all";
      if (page < 0) {
        const brandsWithModels = await this._adminBrandService.getAllBrands();
        const formattedBrands = brandsWithModels.map((brand) => ({
          _id: brand._id.toString(),
          brandName: brand.brandName,
          imageUrl: brand.imageUrl,
          status: brand.status.toString(),
          models: brand.models,
        }));
        const response: GetBrandsResponseDTO = {
          success: true,
          message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Brands"),
          BrandObject: { formattedBrands, totalPage: 0 },
        };
        const validated = GetBrandsResponseSchema.safeParse(response);
        if (!validated.success) {
          res
            .status(StatusCode.INTERNAL_SERVER_ERROR)
            .json({
              success: false,
              message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
            });
          return;
        }
        res.status(StatusCode.OK).json(response);
        return;
      }
      const limit = 4;
      const skip = (page - 1) * limit;
      const { brandsWithModels, totalCount } =
        await this._adminBrandService.getBrands({
          search,
          skip,
          limit,
          statusFilter,
        });
      const totalPage = Math.max(totalCount / limit);
      const formattedBrands = brandsWithModels.map((brand) => ({
        _id: brand._id.toString(),
        brandName: brand.brandName,
        imageUrl: brand.imageUrl,
        status: brand.status.toString(),
        models: brand.models,
      }));
      const response: GetBrandsResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Brands"),
        BrandObject: { formattedBrands, totalPage },
      };
      const validated = GetBrandsResponseSchema.safeParse(response);
      if (!validated.success) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
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
          message: RESPONSE_MESSAGES.INVALID_INPUT,
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
          message: RESPONSE_MESSAGES.RESOURCE_UPDATE_FAILED("Brand"),
        });
        return;
      }
      const response: ToggleBrandStatusResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Brand"),
        brand: {
          _id: updatedBrand._id.toString(),
          brandName: updatedBrand.brandName,
          imageUrl: updatedBrand.imageUrl,
          status: updatedBrand.status.toString(), // Ensure status is string (in case it's an enum or boolean)
        },
      };
      const validated = ToggleBrandStatusResponseSchema.safeParse(response);
      if (!validated.success) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
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
          message: RESPONSE_MESSAGES.INVALID_INPUT,
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
        res
          .status(StatusCode.NOT_FOUND)
          .json({ message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("Brand") });
        return;
      }
      const brand = { ...updatedBrand, _id: updatedBrand._id.toString() };
      const response: UpdateBrandResponseDTO = {
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Brand"),
        brand: brand,
      };
      const validated = UpdateBrandResponseSchema.safeParse(response);
      if (!validated.success) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
}
