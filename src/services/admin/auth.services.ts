import { UserRepository } from "../../repositories/user.repo";
import { IUser } from "../../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import bcrypt from "bcrypt";
import redis from "../../config/redisConfig";
import { IAdminAuthService } from "../../interfaces/services/admin/IAdminAuthService";

export class AdminAuthService implements IAdminAuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  async adminLogin(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new Error("User doesn't exist");
    }

    if (user.role !== "admin") {
      throw new Error("Access denied: Not an admin");
    }
    if (!user.password) {
      throw new UnauthorizedError("invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Incorrect password");
    }

    const accessToken = generateAccessToken(user._id.toString(), "admin");
    const refreshToken = generateRefreshToken(user._id.toString(), "admin");

    const refreshTokenKey = `refreshToken:admin:${user._id}`;
    const refreshTokenExpirySeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    await redis.set(
      refreshTokenKey,
      refreshToken,
      "EX",
      refreshTokenExpirySeconds
    );

    return { user, accessToken, refreshToken };
  }
}
