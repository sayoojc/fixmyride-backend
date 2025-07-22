import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IAdminUserService } from "../../interfaces/services/admin/IAdminUserService";
import { Types } from "mongoose";
import { UserDTO } from "../../dtos/controllers/admin/adminUser.controller.dto";

@injectable()
export class AdminUserService implements IAdminUserService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly _userRepository: IUserRepository
  ) {}

  async fetchUsers(search: string,
  page: number,
  statusFilter: string): Promise<{users:UserDTO[],totalCount:number} | undefined> {
    try {
return await this._userRepository.fetchUsers(search, page, statusFilter);     
    } catch (error) {
      console.error("Error fetching users:", error);
      return undefined;
    }
  }

  async toggleListing(email: string): Promise<UserDTO | undefined> {
    try {
      const user = await this._userRepository.findOne({ email });
      if (!user) return undefined;

      const updatedUser = await this._userRepository.updateById(
        new Types.ObjectId(user._id),
        {
          isListed: !user.isListed,
        }
      );

      if (!updatedUser) return undefined;

      return {
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        role: updatedUser.role,
        isListed: updatedUser.isListed,
      };
    } catch (error) {
      throw new Error("The toggle listing failed");
    }
  }
}
