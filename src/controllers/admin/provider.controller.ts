import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IAdminProviderService } from "../../interfaces/services/admin/IAdminProviderService";
import { IAdminProviderController } from "../../interfaces/controllers/admin/IAdminProviderController";
type ErrorResponse = { success: false; message: string };
import {
  FetchProviderResponseSchema,
  FetchProviderResponseDTO,
  FetchProvidersResponseSchema,
  FetchProvidersResponseDTO,
  FetchVerificationDataResponseSchema,
  FetchVerificationDataResponseDTO,
  ToggleListingResponseSchema,
  ToggleListingResponseDTO,
  VerifyProviderRequestSchema,
  VerifyProviderRequestDTO,
  VerifyProviderResponseSchema,
  VerifyProviderResponseDTO,
} from "../../dtos/controllers/admin/AdminProvider.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

@injectable()
export class AdminProviderController implements IAdminProviderController {
  constructor(
    @inject(TYPES.AdminProviderService)
    private readonly _adminProviderService: IAdminProviderService
  ) {}

  async fetchProviders(
    req: Request,
    res: Response<FetchProvidersResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const search = req.query.search?.toString() || "";
      const page = parseInt(req.query.page as string);
      const statusFilter = req.query.statusFilter?.toString() || "all";
      const limit = 4;
      const skip = (page - 1) * limit;

      const { sanitizedProviders, totalCount } =
        (await this._adminProviderService.fetchProviders({
          search,
          skip,
          limit,
          statusFilter,
        })) ?? { sanitizedProviders: [], totalCount: 1 };
      const totalPage = Math.ceil(totalCount / limit) || 1;
      const providers = sanitizedProviders.map((provider) => ({
        _id: provider._id?.toString() || "",
        name: provider.name || "",
        email: provider.email || "",
        isListed: provider.isListed ?? false,
        verificationStatus: provider.verificationStatus,
      }));

      const response: FetchProvidersResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Providers"),
        providerResponse: { sanitizedProviders: providers, totalPage },
      };
      const validated = FetchProvidersResponseSchema.safeParse(response);
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
  async fetchVerificationData(
    req: Request<{ id: string }>,
    res: Response<FetchVerificationDataResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const id = req.params.id;
      const verificationData =
        await this._adminProviderService.fetchVerificationData(id);
      const response: FetchVerificationDataResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Verification data"),
        verificationData,
      };
      const validated = FetchVerificationDataResponseSchema.safeParse(response);
      if (!validated.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
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

  async fetchProviderById(
    req: Request<{ id: string }>,
    res: Response<FetchProviderResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const providerId = req.params.id;
      const rawProvider = await this._adminProviderService.fetchProviderById(
        providerId
      );
      if (!rawProvider) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      const sanitizedProvider = {
        _id: rawProvider._id?.toString() || "",
        name: rawProvider.name || "",
        email: rawProvider.email || "",
        isListed: rawProvider.isListed ?? false,
        verificationStatus: rawProvider.verificationStatus ?? "pending",
      };

      const response: FetchProviderResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Provider"),
        provider: sanitizedProvider,
      };

      const validated = FetchProviderResponseSchema.safeParse(response);
      if (!validated.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
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

  async verifyProvider(
    req: Request<{ id: string }, {}, VerifyProviderRequestDTO>,
    res: Response<VerifyProviderResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = VerifyProviderRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const providerId = req.params.id;
      if (!req.params.id) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const { verificationAction, adminNotes } = parsed.data;
      const rawProvider = await this._adminProviderService.verifyProvider(
        providerId,
        verificationAction,
        adminNotes ?? ""
      );
      if (!rawProvider) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      const sanitizedProvider = {
        _id: rawProvider._id?.toString() || "",
        name: rawProvider.name || "",
        email: rawProvider.email || "",
        isListed: rawProvider.isListed ?? false,
        verificationStatus: rawProvider.verificationStatus ?? "pending",
      };
      const response: VerifyProviderResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Provider"),
        provider: sanitizedProvider,
      };
      const validated = VerifyProviderResponseSchema.safeParse(response);
      if (!validated.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
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

  async toggleListing(
    req: Request<{ id: string }, {}>,
    res: Response<ToggleListingResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const providerId = req.params.id;
      if (!req.params.id) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const rawProvider = await this._adminProviderService.toggleListing(
        providerId
      );
      if (!rawProvider) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      const sanitizedProvider = {
        _id: rawProvider._id?.toString() || "",
        name: rawProvider.name || "",
        email: rawProvider.email || "",
        isListed: rawProvider.isListed ?? false,
        verificationStatus: rawProvider.verificationStatus ?? "pending",
      };
      const response: ToggleListingResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("User"),
        user: sanitizedProvider,
      };
      const validated = ToggleListingResponseSchema.safeParse(response);
      if (!validated.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
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
}
