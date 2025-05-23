import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AdminUserService } from "../../services/admin/user.service";
import { IAdminUserController } from "../../interfaces/controllers/admin/IAdminUserController";
import {
  ToggleListingRequestDTO,
  ToggleListingRequestSchema,
  ToggleListingResponseDTO,
  FetchUsersResponseDTO,
  FetchUsersResponseSchema,
  ToggleListingResponseSchema,
  ErrorResponse,
  UserDTO,
} from "../../dtos/controllers/admin/adminUser.controller.dto";

// Optional: sanitize helper
function sanitizeUser(user: any): UserDTO {
  return {
    _id: user._id?.toString() ?? "",
    name: user.name ?? "",
    email: user.email ?? "",
    isListed: user.isListed ?? false,
  };
}
@injectable()
export class AdminUserController implements IAdminUserController {
  constructor(
    @inject(AdminUserService) private adminUserService: AdminUserService
  ) {}

  async fetchUsers(req: Request, res: Response<FetchUsersResponseDTO | ErrorResponse>): Promise<void> {
    try {
const users = (await this.adminUserService.fetchUsers()) ?? [];

      const sanitizedUsers = (users.map(sanitizeUser)) ?? [];      
     
      const response: FetchUsersResponseDTO = {
        success: true,
        message: "Users fetched successfully",
        users: sanitizedUsers,
      };

      const validated = FetchUsersResponseSchema.safeParse(response);
      if (!validated.success) {
        console.error("Zod validation failed", validated.error);
        throw new Error("Response DTO validation failed");
      }

      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async toggleListing(req: Request<{},{},ToggleListingRequestDTO>, res: Response<ToggleListingResponseDTO | ErrorResponse>): Promise<void> {
    try {
         const parsed = ToggleListingRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new Error("Invalid request body");
      }

      const email = parsed.data.email;
      const updatedUser = await this.adminUserService.toggleListing(email);
         if (!updatedUser) {
        throw new Error("User not found or could not update listing");
      }
             const response: ToggleListingResponseDTO = {
        success: true,
        message: `User has been ${updatedUser.isListed ? "unblocked" : "blocked"}`,
        user: sanitizeUser(updatedUser),
      };
          const validated = ToggleListingResponseSchema.safeParse(response);
      if (!validated.success) {
        console.error("Zod validation error", validated.error);
        throw new Error("Response DTO validation failed");
      }

        res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}
