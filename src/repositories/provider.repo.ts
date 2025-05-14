import { BaseRepository } from "./base/base.repo";
import { IServiceProvider } from "../models/provider.model"; // Your Provider interface
import { Model } from "mongoose";

export class ProviderRepository extends BaseRepository<IServiceProvider> {
  constructor(providerModel: Model<IServiceProvider>) {
    super(providerModel);
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

}
