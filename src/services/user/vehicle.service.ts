import { VehicleRepository } from "../../repositories/vehicle.repo";
import mongoose from "mongoose";
import { IUserVehicleService } from "../../interfaces/services/user/IUserVehicleService";
import { VehicleDTO } from "../../dtos/controllers/user/userProfile.controller.dto";
export class UserVehicleService implements IUserVehicleService {
  constructor(private vehicleRepository: VehicleRepository) {}
  async addVehicle(
    userId: string,
    brandId: string,
    brandName: string,
    modelId: string,
    modelName: string,
    fuelType: string
  ): Promise<VehicleDTO | undefined> {
    try {
      let id = new mongoose.Types.ObjectId(userId);
      const vehicle = await this.vehicleRepository.create({
        userId: id,
        brandId: new mongoose.Types.ObjectId(brandId),
        modelId: new mongoose.Types.ObjectId(modelId),
        fuel: fuelType,
      });
      await vehicle.populate("brandId");
      await vehicle.populate("modelId");
      await vehicle.populate("brandId");
      await vehicle.populate("modelId");

const populatedVehicle = vehicle as unknown as {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fuel: string;
  brandId: {
    _id: mongoose.Types.ObjectId;
    status: string;
    brandName: string;
    imageUrl: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  modelId: {
    _id: mongoose.Types.ObjectId;
    status: string;
    name: string;
    imageUrl: string;
    brandId:string;
    fuelTypes:string[];
    createdAt?: Date;
    updatedAt?: Date;
  };
};

      return {
  _id: populatedVehicle._id.toString(),
  userId: populatedVehicle.userId.toString(),
  brandId: {
    _id: populatedVehicle.brandId._id.toString(),
    status: populatedVehicle.brandId.status,
    brandName: populatedVehicle.brandId.brandName,
    imgeUrl: populatedVehicle.brandId.imageUrl,
    createdAt: populatedVehicle.brandId.createdAt?.toString(),
    updatedAt: populatedVehicle.brandId.updatedAt?.toString(),
  },
modelId: {
  _id: populatedVehicle.modelId._id.toString(),
  status: populatedVehicle.modelId.status,
  name: populatedVehicle.modelId.name,
  imageUrl: populatedVehicle.modelId.imageUrl,
  brandId: populatedVehicle.modelId.brandId.toString(), // 🆕 Added
  fuelTypes: populatedVehicle.modelId.fuelTypes,        // 🆕 Added
  createdAt: populatedVehicle.modelId.createdAt?.toString(),
  updatedAt: populatedVehicle.modelId.updatedAt?.toString(),
},
  fuel: populatedVehicle.fuel,
};

    } catch (error) {
      console.error("Error fetching users:", error);
      return undefined;
    }
  }
}
