// services/admin/adminUser.service.ts

import { UserRepository } from "../../repositories/user.repo";

type SanitizedUser = {
  name: string;
  email: string;
  phone?: string;
  role: string;
  isListed: boolean;
};

export class AdminUserService {
  constructor(private userRepository: UserRepository) {}

  async fetchUsers(): Promise<SanitizedUser[] | undefined> {
    try {
      console.log('fetch users form admin user service')
      
      const users = await this.userRepository.find({ role: { $ne: "admin" } });
      console.log(users);
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

      const updatedUser = await this.userRepository.updateById(user._id.toString(), {
        isListed: !user.isListed,
      });

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
