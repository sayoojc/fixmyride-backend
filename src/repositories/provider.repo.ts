import { BaseRepository } from "./base/base.repo";
import { IServiceProvider } from "../models/provider.model"; // Your Provider interface
import { Model } from "mongoose";
import { IProviderRepository } from "../interfaces/repositories/IProviderRepository";

export class ProviderRepository extends BaseRepository<IServiceProvider> implements IProviderRepository {
  private readonly providerModel:Model<IServiceProvider>
  constructor(providerModel: Model<IServiceProvider>) {
    super(providerModel);
    this.providerModel = providerModel
  }
    async createUserFromGoogle(
          googleId:string,
          name:string,
          email:string,
        ): Promise<IServiceProvider> {
      
  let existingUser;
      if(email){
        existingUser = await this.findOne({email});
      }
      if (existingUser) return existingUser;
  
      const userData: Partial<IServiceProvider> = {
        name,
        email,
        googleId,
        provider: 'google',
      };
  
      return await this.create(userData);
    }
        async countDocuments(query: any): Promise<number> {
        return this.providerModel.countDocuments(query);
      }
    
      async findWithPagination(query: any, skip: number, limit: number): Promise<IServiceProvider[]> {
        return this.providerModel.find(query).skip(skip).limit(limit);
      }
    
      // Optional: override find if not already in BaseRepository
      async findWithQuery(query: any): Promise<IServiceProvider[]> {
        return this.providerModel.find(query);
      }
  }
