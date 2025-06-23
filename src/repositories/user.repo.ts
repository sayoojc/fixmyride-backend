import { BaseRepository } from "./base/base.repo";
import  { IUser } from "../models/user.model";
import { Model } from "mongoose";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { UserDTO } from "../dtos/controllers/admin/adminUser.controller.dto";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
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
  async fetchUsers(
  search: string,
  page: number,
  statusFilter: string
): Promise<UserDTO[]> {
  try {
    const pageSize = 10; // or whatever your default
    const skip = (page - 1) * pageSize;

    const query: any = {
      role: { $ne: "admin" },
    };

    // Apply search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Apply status filter (assuming you use isListed as status)
    if (statusFilter === "listed") {
      query.isListed = true;
    } else if (statusFilter === "unlisted") {
      query.isListed = false;
    }

    const users = await this.userModel
      .find(query)
      .skip(skip)
      .limit(pageSize);

    return users.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      isListed: user.isListed,
    }));
  } catch (error) {
    console.error("Error in repo fetching users:", error);
    return [];
  }
}

}
