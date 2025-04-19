
import { UserRepository } from "../repositories/user.repo";
import { IUser } from "../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import { hashPassword } from "../utils/hashPassword";
import { validateOtp } from "../utils/otpValidator";
import { UnauthorizedError } from "../errors/unauthorizedError";
import { NotFoundError } from "../errors/notFoundError";
import bcrypt from "bcrypt";
import redis from "../config/redisConfig";
import jwt,{JwtPayload} from 'jsonwebtoken';

type TempUser = {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp:string;
    createdAt:Date;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor(
    userRepository: UserRepository,
  ) {
    this.userRepository = userRepository;
  }

  async refreshToken(token: string): Promise<{
    accessToken: string;
    id: string;
    role: string;
    name: string;
    email: string;
    refreshToken: string;
  } | null> {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_REFRESH_TOKEN_SECRET!
      ) as null | JwtPayload;

      if (!payload) {
        return null;
      }
      const userExists = await redis.get(`refreshToken:${payload.id}`);
      if (!userExists) {
        return null;
      }
      const user = await this.userRepository.findUserById(payload.id);
      if (!user || !user.isListed) {
        return null;
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );
      // Creating refresh token everytime /refresh endpoint hits (Refresh token rotation)
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_TOKEN_SECRET!,
        { expiresIn: "1d" }
      );

      //storing the refresh token in redis
      await redis.set(
        `refreshToken:${user.id}`,
        refreshToken,
        "EX",
        60 * 60 * 24
      );

      return {
        accessToken,
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        refreshToken,
      };
    } catch (error) {
      return null;
    }
  }
  async registerTempUser(userData:Partial<TempUser>): Promise<TempUser> {
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
      createdAt: new Date()
    };
  
    await redis.set(redisKey, JSON.stringify(tempUser), 'EX', 120);
  
    return tempUser;
  }
  
 
  async registerUser(
  otp: string,
  email: string,
  phone: string
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {

  // Check if the user already exists
  const existingUser = await this.userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists. Please log in.");
  }

  const existingPhone = await this.userRepository.findUserByPhone(phone);
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


  const user = await this.userRepository.createUser({
    name: tempUser.name,
    email: tempUser.email,
    phone: tempUser.phone,
    password: tempUser.password,
  });

 
  await redis.del(redisKey);

  // 🔐 Generate tokens
  const accessToken = generateAccessToken(user._id.toString(), 'user');
  const refreshToken = generateRefreshToken(user._id.toString(), 'user');

  const refreshTokenKey = `refreshToken:user:${user._id}`;
  const refreshTokenExpirySeconds = 7 * 24 * 60 * 60; // 7 days in seconds
  await redis.set(refreshTokenKey, refreshToken, 'EX', refreshTokenExpirySeconds);


  return { user, accessToken, refreshToken };
}


  async userLogin(email:string,
    password:string):Promise<{user: IUser; accessToken: string; refreshToken: string}>{
      const user = await this.userRepository.findUserByEmail(email);
      console.log('The user ',user);
      if (!user) {
        throw new NotFoundError("User doesn't exist");
      }
      if(!user.password){
        throw new UnauthorizedError('invalid credentials')
      }
          // Verify password
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            
            throw new UnauthorizedError('Invalid credentials');
          }
          if(user.role !== "user"){
            throw new UnauthorizedError('No authorization');
          }

      const accessToken = generateAccessToken(user._id.toString(),'user');
      const refreshToken = generateRefreshToken(user._id.toString(),'user');

  const refreshTokenKey = `refreshToken:user:${user._id}`;
  const refreshTokenExpirySeconds = 7 * 24 * 60 * 60; // 7 days in seconds
  await redis.set(refreshTokenKey, refreshToken, 'EX', refreshTokenExpirySeconds);

   return {user,accessToken,refreshToken}
  }

  // async validateToken(userId: string) {
  //   try {
    
  //     const storedTokens = await this.refreshTokenRepository.findAllByUser(userId);
  
      
  //     return storedTokens;
  //   } catch (error) {
  //     console.error("Error validating token:", error);
  //     throw new Error("Failed to validate token");
  //   }
  // }


  async adminLogin(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    
    
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User doesn't exist");
    }

   
    if (user.role !== "admin") {
      throw new Error("Access denied: Not an admin");
    }
    if(!user.password){
      throw new UnauthorizedError('invalid credentials')
    }
   
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Incorrect password");
    }

   
    const accessToken = generateAccessToken(user._id.toString(), "admin");
    const refreshToken = generateRefreshToken(user._id.toString(), "admin");

   
    const refreshTokenKey = `refreshToken:admin:${user._id}`;
    const refreshTokenExpirySeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    await redis.set(refreshTokenKey, refreshToken, 'EX', refreshTokenExpirySeconds);

    return { user, accessToken, refreshToken };
  }
  async providerLogin(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    
    
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User doesn't exist");
    }

    
    if (user.role !== "provider") {
      throw new Error("Access denied: Not a provider");
    }

    if(!user.password){
      throw new UnauthorizedError('invalid credentials')
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Incorrect password");
    }

    
    const accessToken = generateAccessToken(user._id.toString(), "provider");
    const refreshToken = generateRefreshToken(user._id.toString(), "provider");

    
    const refreshTokenKey = `refreshToken:provider:${user._id}`;
    const refreshTokenExpirySeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    await redis.set(refreshTokenKey, refreshToken, 'EX', refreshTokenExpirySeconds);

    return { user, accessToken, refreshToken };
  }

  
  async getRefreshTokenFromRedis(userId: string): Promise<string | null> {
    const redisKey = `refreshToken:user:${userId}`; // Or `refreshToken:admin:${userId}` if applicable
    return await redis.get(redisKey);
  }
  

  async logout(){
   
  }


 

  async forgotPassword(email: string): Promise<{ user: IUser; token: string }> {
    console.log('The forgot Password function from the auth service');
  
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) throw new Error("User doesn't exist");
  
    if (user.role !== "user") throw new Error("Access denied, no authorization");
  
    // 🔐 Create a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.RESET_PASSWORD_SECRET as string,
      { expiresIn: '1h' } // token valid for 1 hour
    );
  
    return { user, token };
  }

  async resetPassword(token: string,password:string): Promise<void> {
    try {
      const payload = jwt.verify(token, process.env.RESET_PASSWORD_SECRET!) as JwtPayload;
  
      if (typeof payload !== 'object' || !payload.userId) {
        throw new Error("Invalid token payload");
      }
  
      const user = await this.userRepository.findUserById(payload.userId);
      if (!user) throw new Error("User not found");
      const hashedPassword = await hashPassword(password);
      user.password = hashedPassword
      await user.save()
      
    } catch (err) {
      throw new Error("Failed to validate token");
    }
  }
  
}