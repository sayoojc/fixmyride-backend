import { UserRepository } from "../../repositories/user.repo";
import { IAdminUserService } from "../../interfaces/services/admin/IAdminUserService";
import { SanitizedUser } from "../../interfaces/User.interface";
import { Types } from "mongoose";

export class AdminUserService implements IAdminUserService {
  constructor(private userRepository: UserRepository) {}

  async fetchUsers(): Promise<SanitizedUser[] | undefined> {
    try {
      const users = await this.userRepository.find({ role: { $ne: "admin" } });
      return users.map((user) => ({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isListed: user.isListed,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return undefined;
    }
  }

  async toggleListing(email: string): Promise<SanitizedUser | undefined> {
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
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isListed: updatedUser.isListed,
      };
    } catch (error) {
      throw new Error("The toggle listing failed");
    }
  }
}
