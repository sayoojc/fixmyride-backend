import { BaseRepository } from "./base/base.repo";
import  { IUser } from "../models/user.model";
import { Model } from "mongoose";


export class UserRepository extends BaseRepository<IUser> {
  
  constructor(userModel:Model<IUser>) {
    super(userModel);  // Injecting the model
  }
 
  async findUserByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }
  
  async findUserById(id: string): Promise<IUser | null> {
    return await this.findOne({ _id: id });
  }
  async findUserByPhone(phone:string):Promise<IUser|null> {
    return await this.findOne({phone:phone})
  }
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return await this.create(userData);
  }
  async createUserFromGoogle(
        googleId:string,
        name:string,
        email:string,
        profilePicture:string
      ): Promise<IUser> {
    
let existingUser;
    if(email){
      existingUser = await this.findUserByEmail(email);
    }
    // Optional: check if user already exists
  
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
