import { IBaseRepository } from "./IBaseRepository";
import { IUser } from "../../models/user.model";

export interface IUserRepository extends IBaseRepository<IUser> {
  createUserFromGoogle(
    googleId: string,
    name: string,
    email: string,
    profilePicture: string
  ): Promise<IUser>;
}
