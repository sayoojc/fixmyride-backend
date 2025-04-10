
import { UserRepository } from "../repositories/user.repo";
import { TempUserRepository } from "../repositories/tempUser.repo";
import { RefreshTokenRepository } from '../repositories/refreshToken.repo'
import { IUser } from "../models/user.model";
import { ITempUser } from "../models/tempUser.model";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import { hashPassword } from "../utils/hashPassword";
import { validateOtp } from "../utils/otpValidator";
import bcrypt from "bcrypt";

export class AuthService {
  private userRepository: UserRepository;
  private tempUserRepository: TempUserRepository;
  private refreshTokenRepository:RefreshTokenRepository;

  constructor(
    userRepository: UserRepository,
    tempUserRepository: TempUserRepository,
    refreshTokenRepository : RefreshTokenRepository
  ) {
    this.userRepository = userRepository;
    this.tempUserRepository = tempUserRepository;
    this.refreshTokenRepository = refreshTokenRepository
  }


  async registerTempUser(userData: Partial<ITempUser>): Promise<ITempUser> {
    const { email, password } = userData;

    // Check if temp user already exists
    const existingUser = await this.tempUserRepository.findUserByEmail(email as string);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password
    const hashedPassword = await hashPassword(password as string);

    // Save the temporary user
    const tempUser = await this.tempUserRepository.createUser({
      ...userData,
      password: hashedPassword,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // TTL 30 min
    });

    return tempUser;
  }

 
  async registerUser(
    otp: string,
    email: string,
    phone:string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // Check if the user already exists
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists. Please log in.");
    }
    const existingPhone = await this.userRepository.findUserByEmail(phone);
    if (existingPhone) {
      throw new Error("The phone number is already in use. Please log in.");
    }

    // Find the temporary user
    const tempUser = await this.tempUserRepository.findUserByEmail(email);
    if (!tempUser) {
      throw new Error("Temp user not found. Please retry.");
    }

    // Validate OTP
    if (!validateOtp(tempUser.otp, otp)) {
      throw new Error("OTP mismatch.");
    }

    // Create the permanent user
    const user = await this.userRepository.createUser({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(),'user');
    const refreshToken = generateRefreshToken(user._id.toString(),'user');
    await this.refreshTokenRepository.createRefreshToken({
      userId: user._id,
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days
    });

    return { user, accessToken, refreshToken };
  }

  async userLogin(email:string,
    password:string):Promise<{user: IUser; accessToken: string; refreshToken: string}>{
    console.log('The user login function from the auth service');
   // Find user by email
      const user = await this.userRepository.findUserByEmail(email);
      console.log('The user ',user);
      if (!user) {
        throw new Error("User doesn't exist");
      }
          // Verify password
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            
           throw new Error('The password doesnt match');
          }
          if(user.role !== "user"){
            throw new Error('Access denied no authorization')
          }

// Generate tokens
const accessToken = generateAccessToken(user._id.toString(),'user');
const refreshToken = generateRefreshToken(user._id.toString(),'user');
await this.refreshTokenRepository.createRefreshToken({
  userId: user._id,
  token: refreshToken,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days
});

   return {user,accessToken,refreshToken}
  }
  async validateToken(userId: string) {
    try {
    
      const storedTokens = await this.refreshTokenRepository.findAllByUser(userId);
  
      
      return storedTokens;
    } catch (error) {
      console.error("Error validating token:", error);
      throw new Error("Failed to validate token");
    }
  }

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

   
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Incorrect password");
    }

   
    const accessToken = generateAccessToken(user._id.toString(), "admin");
    const refreshToken = generateRefreshToken(user._id.toString(), "admin");

   
    await this.refreshTokenRepository.createRefreshToken({
      userId: user._id,
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiration
    });

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

    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Incorrect password");
    }

    
    const accessToken = generateAccessToken(user._id.toString(), "provider");
    const refreshToken = generateRefreshToken(user._id.toString(), "provider");

    
    await this.refreshTokenRepository.createRefreshToken({
      userId: user._id,
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiration
    });

    return { user, accessToken, refreshToken };
  }
  async logout(){
   
  }
  async forgotPassword(email:string,
    ):Promise<{user: IUser;}>{
    console.log('The forgot Password function from the auth service');
   // Find user by email
      const user = await this.userRepository.findUserByEmail(email);
      console.log('The user ',user);
      if (!user) {
        throw new Error("User doesn't exist");
      }
       if(user.role !== "user"){
            throw new Error('Access denied no authorization')
       }
console.log('The user for the forgot password');
   return {user}
  }
}
