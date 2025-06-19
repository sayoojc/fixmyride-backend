import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import {TYPES} from '../../containers/types'
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
  ToggleListingRequestSchema,
  ToggleListingRequestDTO,
  ToggleListingResponseSchema,
  ToggleListingResponseDTO,
  VerifyProviderRequestSchema,
  VerifyProviderRequestDTO,
  VerifyProviderResponseSchema,
  VerifyProviderResponseDTO,
} from "../../dtos/controllers/admin/AdminProvider.controller.dto";

@injectable()
export class AdminProviderController implements IAdminProviderController {
  constructor(
    @inject(TYPES.AdminProviderService)
    private readonly adminProviderService: IAdminProviderService
  ) {}

  async fetchProviders(
    req: Request,
    res: Response<FetchProvidersResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {

                const search = req.query.search?.toString() || "";
    const page = parseInt(req.query.page as string) ;
    const statusFilter = req.query.statusFilter?.toString() || "all";
    const limit = 4;
    const skip = (page - 1) * limit;
      
  const {sanitizedProviders,totalCount} = (await this.adminProviderService.fetchProviders( { search,
      skip,
      limit,
      statusFilter,}))  ?? { sanitizedProviders: [], totalCount: 0 };
      const totalPage = Math.max(totalCount/limit)
    const providers = sanitizedProviders.map((provider) => ({
      _id: provider._id?.toString() || "",
      name: provider.name || "",
      email: provider.email || "",
      isListed: provider.isListed ?? false,
      verificationStatus: provider.verificationStatus ?? "pending",
    }));

    const response: FetchProvidersResponseDTO = {
      success: true,
      message: "Providers fetched successfully",
      providerResponse: {sanitizedProviders:providers,totalPage},
    };

    const validated = FetchProvidersResponseSchema.safeParse(response);
    if (!validated.success) {
      console.error("Zod validation error:", validated.error);
      throw new Error("Response DTO does not match schema");
    }

    res.status(200).json(response);
    } catch (error) {
      res.status(400).json({success:false, message: (error as Error).message });
    }
  }

  async fetchVerificationData(
    req: Request,
    res: Response<FetchVerificationDataResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const id = req.query.id as string;
      const verificationData = await this.adminProviderService.fetchVerificationData(id);
      const response:FetchVerificationDataResponseDTO = {
         success: true,
        message: "Verification data fetched successfully",
        verificationData,
      }
      const validated = FetchVerificationDataResponseSchema.safeParse(response);
      if(!validated.success){
        console.error('Zod validation error',validated.error);
        throw new Error("Response DTO does not match schema");
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({success:false, message: (error as Error).message });
    }
  }

  async fetchProviderById(
    req: Request,
    res: Response<FetchProviderResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const providerId = req.query.id as string;
      const rawProvider = await this.adminProviderService.fetchProviderById(providerId);
         if (!rawProvider) {
      throw new Error("Provider not found");
    }
       const sanitizedProvider = {
      _id: rawProvider._id?.toString() || "",
      name: rawProvider.name || "",
      email: rawProvider.email || "",
      isListed: rawProvider.isListed ?? false,
      verificationStatus: rawProvider.verificationStatus ?? "pending",
    };

      const response:FetchProviderResponseDTO = {
        success: true,
        message: "Provider fetched successfully",
        provider: sanitizedProvider,
      } 
      
    const validated = FetchProviderResponseSchema.safeParse(response);
    if(!validated.success) {
      console.error("Zod validation error:",validated.error);
      throw new Error("Response DTO does not match schema");
    }
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({success:false, message: (error as Error).message });
    }
  }

  async verifyProvider(
    req: Request<{}, {}, VerifyProviderRequestDTO>,
    res: Response<VerifyProviderResponseDTO |ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = VerifyProviderRequestSchema.safeParse(req.body);
      if(!parsed.success){
        throw  new Error("the request dto doesnt match");
      }
      const { providerId, verificationAction, adminNotes } = parsed.data;
      const rawProvider = await this.adminProviderService.verifyProvider(
       providerId,
        verificationAction,
        adminNotes??""
      );
          if (!rawProvider) {
      throw new Error("Provider not found");
    }
          const sanitizedProvider = {
      _id: rawProvider._id?.toString() || "",
      name: rawProvider.name || "",
      email: rawProvider.email || "",
      isListed: rawProvider.isListed ?? false,
      verificationStatus: rawProvider.verificationStatus ?? "pending",
    };
      const response:VerifyProviderResponseDTO = {
        success: true,
        message: "Provider updated successfully",
        provider: sanitizedProvider,
      } 
      const validated = VerifyProviderResponseSchema.safeParse(response);
      if(!validated.success){
        throw new Error("Response DTO does not match schema");
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({success:false,message: (error as Error).message });
    }
  }

  async toggleListing(
    req: Request<{}, {}, ToggleListingRequestDTO>,
    res: Response<ToggleListingResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ToggleListingRequestSchema.safeParse(req.body);
      if(!parsed.success){
        throw new Error('The request dto doesnt match');
      }
      const providerId = parsed.data.providerId
      const rawProvider = await this.adminProviderService.toggleListing(providerId);
             if (!rawProvider) {
      throw new Error("Provider not found");
    }
             const sanitizedProvider = {
      _id: rawProvider._id?.toString() || "",
      name: rawProvider.name || "",
      email: rawProvider.email || "",
      isListed: rawProvider.isListed ?? false,
      verificationStatus: rawProvider.verificationStatus ?? "pending",
    };
      const response:ToggleListingResponseDTO = {
        success: true,
        message: `User has been ${sanitizedProvider?.isListed ? "unblocked" : "blocked"}`,
        user: sanitizedProvider,
      }
      const validated = ToggleListingResponseSchema.safeParse(response);
      if(!validated.success){
        throw new Error("Response DTO does not match schema");
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({success:false,message: (error as Error).message });
    }
  }
}
