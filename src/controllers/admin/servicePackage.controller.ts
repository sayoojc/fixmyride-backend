import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IAdminServicePackageController } from "../../interfaces/controllers/admin/IAdminServicePackageController";
import { IAdminServicePackageService } from "../../interfaces/services/admin/IAdminServicePackageService";
import { TYPES } from "../../containers/types";
import { StatusCode } from "../../enums/statusCode.enum";
import {
  AddServicePackageRequestDTO,
  AddServicePackageResponseDTO,
  ServicePackageSchema,
  AddServicePackageResponseSchema,
  GetServicePackagesResponseDTO,
  getServicePackagesResponseSchema,
  ErrorResponse,
  UpdateServicePackageRequestDTO,
  UpdateServicePackageResponseDTO,
  UpdateServicePackageRequestSchema,
  ToggleBlockStatusRequestDTO,
  ToggleBlockStatusResponseDTO,
  ToggleBlockStatusRequestSchema,
  ToggleBlockStatusResponseSchema,
  UpdateServicePackageResponseSchema,
} from "../../dtos/controllers/admin/adminServicePackageController.dto";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
@injectable()
export class AdminServicePackageController
  implements IAdminServicePackageController
{
  constructor(
    @inject(TYPES.AdminServicePackageService)
    private readonly _adminServicePackageService: IAdminServicePackageService
  ) {}
  async addServicePackage(
    req: Request<{}, {}, AddServicePackageRequestDTO>,
    res: Response<AddServicePackageResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ServicePackageSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const newServicePackage =
        await this._adminServicePackageService.addServicePackage(parsed.data);
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_CREATED("Service Package"),
        servicePackage: newServicePackage,
      };
      const validate = AddServicePackageResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
  async getServicePackages(
    req: Request,
    res: Response<GetServicePackagesResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const search = req.query.search?.toString() || "";
      const page = parseInt(req.query.page as string);
      const statusFilter = req.query.statusFilter?.toString() || "all";
      const fuelFilter = req.query.fuelFilter?.toString() || "";
      const limit = 4;
      const skip = (page - 1) * limit;
      const { servicePackages, totalCount } =
        await this._adminServicePackageService.getServicePackages({
          search,
          skip,
          limit,
          statusFilter,
          fuelFilter,
        });
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Service packages"),
        servicePackageResponse: { servicePackages, totalCount },
      };
      const validate = getServicePackagesResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
  async updateServicePackage(
    req: Request<{}, {}, UpdateServicePackageRequestDTO>,
    res: Response<UpdateServicePackageResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = UpdateServicePackageRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const updatedServicePackage =
        await this._adminServicePackageService.updateServicePackage(
          parsed.data
        );

      if (!updatedServicePackage) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }

      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Service package"),
        servicePackage: updatedServicePackage,
      };

      const validate = UpdateServicePackageResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Response DTO doesn't match",
        });
        return;
      }

      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
  async toggleBlockStatus(
    req: Request<{}, {}, ToggleBlockStatusRequestDTO>,
    res: Response<ToggleBlockStatusResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ToggleBlockStatusRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const updatedServicePackage =
        await this._adminServicePackageService.toggleBlockStatus(parsed.data);

      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Service package"),
        servicePackage: updatedServicePackage,
      };
      const validate = ToggleBlockStatusResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
}
