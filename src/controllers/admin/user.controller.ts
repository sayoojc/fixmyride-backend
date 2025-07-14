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
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

@injectable()
export class AdminUserController implements IAdminUserController {
  constructor(
    @inject(TYPES.AdminUserService)
    private readonly _adminUserService: IAdminUserService
  ) {}

  async fetchUsers(
    req: Request,
    res: Response<FetchUsersResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const search = (req.query.search as string) || "";
      const page = parseInt(req.query.page as string) || 1;
      const statusFilter = (req.query.statusFilter as string) || "all";
      const users =
        (await this._adminUserService.fetchUsers(search, page, statusFilter)) ??
        [];

      const response: FetchUsersResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Users"),
        users: users,
      };

      const validated = FetchUsersResponseSchema.safeParse(response);
      if (!validated.success) {
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
        .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  async toggleListing(
    req: Request<{}, {}, ToggleListingRequestDTO>,
    res: Response<ToggleListingResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = ToggleListingRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }

      const email = parsed.data.email;
      const updatedUser = await this._adminUserService.toggleListing(email);
      if (!updatedUser) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("User"),
        });
        return;
      }
      const response: ToggleListingResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("User"),
        user: updatedUser,
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
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
}
