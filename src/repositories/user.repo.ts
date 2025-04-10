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
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return await this.create(userData);
  }
}
