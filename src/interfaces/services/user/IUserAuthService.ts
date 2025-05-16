import { IUser } from "../../../models/user.model";
import { TempUser } from "../../../interfaces/User.interface";

export interface IUserAuthService {
  registerTempUser(userData: Partial<TempUser>): Promise<TempUser>;

  registerUser(
    otp: string,
    email: string,
    phone: string
  ): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }>;

  userLogin(
    email: string,
    password: string
  ): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }>;

  getRefreshTokenFromRedis(userId: string): Promise<string | null>;

  forgotPassword(email: string): Promise<{
    user: IUser;
    token: string;
  }>;

  resetPassword(token: string, password: string): Promise<void>;
}
