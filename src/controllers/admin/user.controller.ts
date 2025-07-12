import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IAdminUserService } from "../../interfaces/services/admin/IAdminUserService";
import { IAdminUserController } from "../../interfaces/controllers/admin/IAdminUserController";
import {
  ToggleListingRequestDTO,
  ToggleListingRequestSchema,
  ToggleListingResponseDTO,
  FetchUsersResponseDTO,
  FetchUsersResponseSchema,
  ToggleListingResponseSchema,
  ErrorResponse,
} from "../../dtos/controllers/admin/adminUser.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";

@injectable()
export class AdminUserController implements IAdminUserController {
  constructor(
    @inject(TYPES.AdminUserService) private readonly _adminUserService: IAdminUserService
  ) {}

  async fetchUsers(
    req: Request,
    res: Response<FetchUsersResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
       const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const statusFilter = (req.query.statusFilter as string) || "all";
    const users = await this._adminUserService.fetchUsers(search, page, statusFilter) ?? [];

      const response: FetchUsersResponseDTO = {
        success: true,
        message: "Users fetched successfully",
        users: users,
      };

      const validated = FetchUsersResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO validation failed");
      }

      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
    }
  }

  async toggleListing(
    req: Request<{}, {}, ToggleListingRequestDTO>,
    res: Response<ToggleListingResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ToggleListingRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new Error("Invalid request body");
      }

      const email = parsed.data.email;
      const updatedUser = await this._adminUserService.toggleListing(email);
      if (!updatedUser) {
        throw new Error("User not found or could not update listing");
      }
      const response: ToggleListingResponseDTO = {
        success: true,
        message: `User has been ${
          updatedUser.isListed ? "unblocked" : "blocked"
        }`,
        user: updatedUser,
      };
      const validated = ToggleListingResponseSchema.safeParse(response);
      if (!validated.success) {
        console.error("Zod validation error", validated.error);
        throw new Error("Response DTO validation failed");
      }

      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
    }
  }
}
