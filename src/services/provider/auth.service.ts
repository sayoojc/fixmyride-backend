import { inject,injectable } from "inversify";
import {TYPES} from '../../containers/types'
import { IProviderRepository } from "../../interfaces/repositories/IProviderRepository";
import { IServiceProvider } from "../../models/provider.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken";
import { hashPassword } from "../../utils/hashPassword";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import bcrypt from "bcrypt";
import redis from "../../config/redisConfig";
import { Providerdata,TempProvider } from "../../interfaces/Provider.interface";
import { IProviderAuthService } from "../../interfaces/services/provider/IproviderAuthService";

@injectable()
export class ProviderAuthService implements IProviderAuthService {
   constructor(
  @inject(TYPES.ProviderRepository)private readonly providerRepository:IProviderRepository
  ) {}

  
  async providerRegisterTemp(providerData:Providerdata): Promise<TempProvider> {
    const {name,email,phone,password,address,otp} = providerData
    if (!name || !email || !phone ||!address|| !password) {
      throw new Error("Missing required user data fields");
    }
  
    const redisKey = `tempProvider:${email}`;
    const hashedPassword = await hashPassword(password);
    const tempProvider: TempProvider = {
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      address,
      createdAt: new Date()
    };
  
    await redis.set(redisKey, JSON.stringify(tempProvider), 'EX', 120);
    let savedData = await redis.get(redisKey);
  
    return tempProvider;
  }
  async providerRegister(providerData:{email:string,otp:string,phone:string}): Promise<IServiceProvider | null> {
    
    const { otp, email, phone } = providerData;
  
    if (!otp || !email || !phone) {
      throw new Error("Missing required user data fields");
    }
  
    const redisKey = `tempProvider:${email}`;
  
    const redisProviderString = await redis.get(redisKey);
  
    if (!redisProviderString) {
      throw new Error('Otp data not found');
    }
  
    let redisProvider;
    try {
      redisProvider = JSON.parse(redisProviderString);
    } catch (err) {
      throw new Error('Failed to parse provider data');
    }
  
    const { otp: redisOtp, ...userData } = redisProvider;
  
    if (redisOtp !== otp) {
      return null;
    }
  
    try {
      const provider = await this.providerRepository.create(userData);
      return provider;
    } catch (err) {
      throw new Error('Failed to create provider');
    }
  }
  
  

  async providerLogin(
    email: string,
    password: string
  ): Promise<{ provider: IServiceProvider; accessToken: string; refreshToken: string }> {
    
    
    const provider = await this.providerRepository.findOne({email});
    if (!provider) {
      throw new UnauthorizedError("User doesn't exist");
    }
    
    if (!provider.password) {
      throw new UnauthorizedError("Invalid credentials");
    }
    const passwordMatch = await bcrypt.compare(password, provider.password);
    if (!passwordMatch) {
      throw new UnauthorizedError("Incorrect password");
    }
    
    const accessToken = generateAccessToken(provider._id.toString(), "provider");
    const refreshToken = generateRefreshToken(provider._id.toString(), "provider");

    
    const refreshTokenKey = `refreshToken:provider:${provider._id}`;
    const refreshTokenExpirySeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    await redis.set(refreshTokenKey, refreshToken, 'EX', refreshTokenExpirySeconds);

    return { provider, accessToken, refreshToken };

  }
  
}