import { UserDTO } from "../../../dtos/controllers/admin/adminUser.controller.dto";
export interface IAdminUserService {
  fetchUsers(): Promise<UserDTO[] | undefined>;

  toggleListing(email: string): Promise<UserDTO | undefined>;
}
