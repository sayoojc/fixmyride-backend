import { BaseRepository } from "./base/base.repo";
import { IServiceProvider } from "../models/provider.model"; // Your Provider interface
import { Model } from "mongoose";

export class ProviderRepository extends BaseRepository<IServiceProvider> {
  constructor(providerModel: Model<IServiceProvider>) {
    super(providerModel);
  }

  async findByCity(city: string): Promise<IServiceProvider[]> {
    return this.find({ "address.city": city });
  }

  async findVerifiedProviders(): Promise<IServiceProvider[]> {
    return this.find({ isVerified: true });
  }

  async findByServiceType(service: string): Promise<IServiceProvider[]> {
    return this.find({ servicesOffered: service });
  }
  async findProviderByEmail(email:string):Promise<IServiceProvider | null>{
    return this.findOne({email});
  }
    async createUserFromGoogle(
          googleId:string,
          name:string,
          email:string,
        ): Promise<IServiceProvider> {
      
  let existingUser;
      if(email){
        existingUser = await this.findProviderByEmail(email);
      }
      // Optional: check if user already exists
    
      if (existingUser) return existingUser;
  
      const userData: Partial<IServiceProvider> = {
        name,
        email,
        googleId,
        provider: 'google',
      };
  
      return await this.create(userData);
    }

}
