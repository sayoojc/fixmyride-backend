import { BaseRepository } from "./base/base.repo";
import  { IUser } from "../models/user.model";
import { Model } from "mongoose";


export class UserRepository extends BaseRepository<IUser> {
 private readonly userModel: Model<IUser>;
  constructor(userModel:Model<IUser>) {
    super(userModel);  
    this.userModel = userModel;
  }
  async createUserFromGoogle(
        googleId:string,
        name:string,
        email:string,
        profilePicture:string
      ): Promise<IUser> {
    
let existingUser;
    if(email){
      existingUser = await this.findOne({email});
    }
    if (existingUser) return existingUser;

    const userData: Partial<IUser> = {
      name,
      email,
      googleId,
      profilePicture,
      provider: 'google',
    };

    return await this.create(userData);
  }
}
