import { IBaseRepository } from "./IBaseRepository";
import { IUser } from "../../models/user.model";
import { UserDTO } from "../../dtos/controllers/admin/adminUser.controller.dto";

export interface IUserRepository extends IBaseRepository<IUser> {
  createUserFromGoogle(
    googleId: string,
    name: string,
    email: string,
    profilePicture: string
  ): Promise<IUser>;
   fetchUsers(
    search: string,
    page: number,
    statusFilter: string
  ): Promise<UserDTO[]>
}
