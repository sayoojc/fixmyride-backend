import { inject,injectable } from "inversify";
import {TYPES} from '../../containers/types'
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IUser } from "../../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken";
import { hashPassword } from "../../utils/hashPassword";
import { validateOtp } from "../../utils/otpValidator";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import { NotFoundError } from "../../errors/notFoundError";
import bcrypt from "bcrypt";
import redis from "../../config/redisConfig";
import jwt, { JwtPayload } from "jsonwebtoken";
import { TempUser } from "../../interfaces/User.interface";
import { IUserAuthService } from "../../interfaces/services/user/IUserAuthService";

@injectable()
export class UserAuthService implements IUserAuthService {

  constructor(
    @inject(TYPES.UserRepository)private readonly _userRepository: IUserRepository) {
    
  }
  async registerTempUser(userData: Partial<TempUser>): Promise<TempUser> {
    const { name, email, phone, password, otp } = userData;

    if (!name || !email || !phone || !password || !otp) {
      throw new Error("Missing required user data fields");
    }

    const redisKey = `tempuser:${email}`;

    const existing = await redis.get(redisKey);
    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const tempUser: TempUser = {
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      createdAt: new Date(),
    };

    await redis.set(redisKey, JSON.stringify(tempUser), "EX", 120);

    return tempUser;
  }

  async registerUser(
    otp: string,
    email: string,
    phone: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const existingUser = await this._userRepository.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists. Please log in.");
    }

    const existingPhone = await this._userRepository.findOne({ phone });
    if (existingPhone) {
      throw new Error("The phone number is already in use. Please log in.");
    }

    const redisKey = `tempuser:${email}`;
    const tempUserData = await redis.get(redisKey);

    if (!tempUserData) {
      throw new Error("Temp user not found. Please retry.");
    }

    const tempUser: TempUser = JSON.parse(tempUserData);

    if (!validateOtp(tempUser.otp, otp)) {
      throw new Error("OTP mismatch.");
    }

    const user = await this._userRepository.create({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
    });

    await redis.del(redisKey);

    const accessToken = generateAccessToken(user._id.toString(), "user");
    const refreshToken = generateRefreshToken(user._id.toString(), "user");

    const refreshTokenKey = `refreshToken:user:${user._id}`;
    const refreshTokenExpirySeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    await redis.set(
      refreshTokenKey,
      refreshToken,
      "EX",
      refreshTokenExpirySeconds
    );

    return { user, accessToken, refreshToken };
  }

  async userLogin(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this._userRepository.findOne({ email });
    if (!user) {
      throw new NotFoundError("User doesn't exist");
    }
    if (!user.password) {
      throw new UnauthorizedError("invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }
    if (user.role !== "user") {
      throw new UnauthorizedError("No authorization");
    }

    const accessToken = generateAccessToken(user._id.toString(), "user");
    const refreshToken = generateRefreshToken(user._id.toString(), "user");

    const refreshTokenKey = `refreshToken:user:${user._id}`;
    const refreshTokenExpirySeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    await redis.set(
      refreshTokenKey,
      refreshToken,
      "EX",
      refreshTokenExpirySeconds
    );

    return { user, accessToken, refreshToken };
  }

  async getRefreshTokenFromRedis(userId: string): Promise<string | null> {
    const redisKey = `refreshToken:user:${userId}`; // Or `refreshToken:admin:${userId}` if applicable
    return await redis.get(redisKey);
  }
  async forgotPassword(email: string): Promise<{ user: IUser; token: string }> {
    const user = await this._userRepository.findOne({ email });
    if (!user) throw new Error("User doesn't exist");

    if (user.role !== "user")
      throw new Error("Access denied, no authorization");

    const token = jwt.sign(
      { userId: user._id },
      process.env.RESET_PASSWORD_SECRET as string,
      { expiresIn: "1h" }
    );

    return { user, token };
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      const payload = jwt.verify(
        token,
        process.env.RESET_PASSWORD_SECRET!
      ) as JwtPayload;

      if (typeof payload !== "object" || !payload.userId) {
        throw new Error("Invalid token payload");
      }

      const user = await this._userRepository.findOne({ _id: payload.userId });
      if (!user) throw new Error("User not found");
      const hashedPassword = await hashPassword(password);
      user.password = hashedPassword;
      await user.save();
    } catch (err) {
      throw new Error("Failed to validate token");
    }
  }
}
