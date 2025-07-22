import { UserDTO } from "../../../dtos/controllers/admin/adminUser.controller.dto";
export interface IAdminUserService {
  fetchUsers(
    search: string,
    page: number,
    statusFilter: string
  ): Promise<{users:UserDTO[],totalCount:number} | undefined>;

  toggleListing(email: string): Promise<UserDTO | undefined>;
}
