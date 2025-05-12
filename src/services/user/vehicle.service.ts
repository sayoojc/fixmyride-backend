import { UserRepository } from "../../repositories/user.repo";
import { VehicleRepository } from "../../repositories/vehicle.repo";
import { IVehicle } from "../../models/vehicle.model";
import mongoose from "mongoose";



export class UserVehicleService {
  constructor(private userRepository: UserRepository,private vehicleRepository:VehicleRepository) {}
async addVehicle(userId:string,brandId:string,brandName:string,modelId:string,modelName:string,fuelType:string):Promise<IVehicle|undefined>{
  
        try {
            let id = new mongoose.Types.ObjectId(userId);
            console.log(id,brandId,brandName,modelId,modelName,fuelType);
        const vehicle = await this.vehicleRepository.createVehicle({
            userId:id,
            brandId:new mongoose.Types.ObjectId(brandId),
            modelId:new mongoose.Types.ObjectId(modelId),
            fuel:fuelType
        });
        console.log('vehicle created',vehicle);
          return vehicle
        } catch (error) {
            console.error("Error fetching users:", error);
            return undefined;
        }
    }


 
}
