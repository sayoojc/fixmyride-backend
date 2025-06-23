import { UserDTO } from "../../../dtos/controllers/admin/adminUser.controller.dto";
export interface IAdminUserService {
  fetchUsers(
    search: string,
    page: number,
    statusFilter: string
  ): Promise<UserDTO[] | undefined>;

  toggleListing(email: string): Promise<UserDTO | undefined>;
}
