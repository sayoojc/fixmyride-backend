import { VehicleRepository } from "../../repositories/vehicle.repo";
import { IVehicle } from "../../models/vehicle.model";
import mongoose from "mongoose";
import { IUserVehicleService } from "../../interfaces/services/user/IUserVehicleService";

export class UserVehicleService implements IUserVehicleService {
  constructor(private vehicleRepository: VehicleRepository) {}
  async addVehicle(
    userId: string,
    brandId: string,
    brandName: string,
    modelId: string,
    modelName: string,
    fuelType: string
  ): Promise<IVehicle | undefined> {
    try {
      let id = new mongoose.Types.ObjectId(userId);
      const vehicle = await this.vehicleRepository.create({
        userId: id,
        brandId: new mongoose.Types.ObjectId(brandId),
        modelId: new mongoose.Types.ObjectId(modelId),
        fuel: fuelType,
      });
      return vehicle;
    } catch (error) {
      console.error("Error fetching users:", error);
      return undefined;
    }
  }
}
