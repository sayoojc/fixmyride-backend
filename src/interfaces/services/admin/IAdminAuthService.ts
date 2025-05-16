import { IUser } from "../../../models/user.model";

export interface IAdminAuthService {
  adminLogin(email: string, password: string): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }>;
}
