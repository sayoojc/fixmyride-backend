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
    private readonly userRepository: IUserRepository
  ) {}

  async fetchUsers(search: string,
  page: number,
  statusFilter: string): Promise<UserDTO[] | undefined> {
    try {
return await this.userRepository.fetchUsers(search, page, statusFilter);     
//  return users.map((user) => ({
//         _id: user._id.toString(),
//         name: user.name,
//         email: user.email,
//         phone: user.phone || "",
//         role: user.role,
//         isListed: user.isListed,
//       }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return undefined;
    }
  }

  async toggleListing(email: string): Promise<UserDTO | undefined> {
    try {
      const user = await this.userRepository.findOne({ email });
      if (!user) return undefined;

      const updatedUser = await this.userRepository.updateById(
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
