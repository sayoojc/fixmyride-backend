import { BaseRepository } from "./base/base.repo";
import { ITempUser } from "../models/tempUser.model";
import { Model } from "mongoose";

export class TempUserRepository extends BaseRepository<ITempUser> {
  constructor(tempUserModel: Model<ITempUser>) {
    super(tempUserModel);
  }

 
  async findUserByEmail(email: string): Promise<ITempUser | null> {
    return await this.findOne({ email });
  }

  
  async createUser(userData: Partial<ITempUser>): Promise<ITempUser> {
    return await this.create(userData);
  }
}
