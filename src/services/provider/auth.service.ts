
import { UserRepository } from "../../repositories/user.repo";
import { ProviderRepository } from "../../repositories/provider.repo";
import { IServiceProvider } from "../../models/provider.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken";
import { hashPassword } from "../../utils/hashPassword";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import bcrypt from "bcrypt";
import redis from "../../config/redisConfig";
import jwt,{JwtPayload} from 'jsonwebtoken';

type TempUser = {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp:string;
    createdAt:Date;
}
type TempProvider = {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  otp:string;
  createdAt:Date;
}
interface Providerdata {
  name: string;
  email: string;
  phone: string;
  password:string;
  otp:string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}
export class ProviderAuthService {
  private providerRepository:ProviderRepository
   constructor(
    providerRepository:ProviderRepository
  ) {
    this.providerRepository = providerRepository
  }

  
  async providerRegisterTemp(providerData:Providerdata): Promise<TempProvider> {
    const {name,email,phone,password,address,otp} = providerData
    console.log('provider data',providerData);
    console.log('The provider register temp service')
  
    if (!name || !email || !phone ||!address|| !password) {
      throw new Error("Missing required user data fields");
    }
  
    const redisKey = `tempProvider:${email}`;
   console.log('redis key',redisKey);
    const hashedPassword = await hashPassword(password);
     console.log('hashedPassword',hashedPassword)
    const tempProvider: TempProvider = {
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      address,
      createdAt: new Date()
    };
    console.log('tempProvider',tempProvider);
  
    await redis.set(redisKey, JSON.stringify(tempProvider), 'EX', 120);
    let savedData = await redis.get(redisKey);
    console.log('saved Data',savedData);
  
    return tempProvider;
  }
  async providerRegister(providerData:Providerdata): Promise<IServiceProvider | null> {
    console.log('➡️ Provider Register Service Called');
    
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