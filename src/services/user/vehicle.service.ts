import { inject,injectable } from "inversify";
import {TYPES} from '../../containers/types'
import { IVehicleRepository } from "../../interfaces/repositories/IVehicleRepository";
import mongoose from "mongoose";
import { IUserVehicleService } from "../../interfaces/services/user/IUserVehicleService";
import { VehicleDTO } from "../../dtos/controllers/user/userProfile.controller.dto";

@injectable()
export class UserVehicleService implements IUserVehicleService {
  constructor(@inject(TYPES.VehicleRepository) private readonly vehicleRepository: IVehicleRepository) {}
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
    createdAt: populatedVehicle.brandId.createdAt?.toISOString(),
    updatedAt: populatedVehicle.brandId.updatedAt?.toISOString(),
  },
modelId: {
  _id: populatedVehicle.modelId._id.toString(),
  status: populatedVehicle.modelId.status,
  name: populatedVehicle.modelId.name,
  imageUrl: populatedVehicle.modelId.imageUrl,
  brandId: populatedVehicle.modelId.brandId.toString(), 
  fuelTypes: populatedVehicle.modelId.fuelTypes,       
  createdAt: populatedVehicle.modelId.createdAt?.toISOString(),
  updatedAt: populatedVehicle.modelId.updatedAt?.toISOString(),
},
  fuel: populatedVehicle.fuel,
};

    } catch (error) {
      console.error("Error adding vehicles:", error);
      return undefined;
    }
  }
async getVehicle(id: string) {
  try {
    const vehicles = await this.vehicleRepository.findVehicleDataPopulatedByUserId( id )

    if(!vehicles){
      throw new Error("vehicle fetching failed")
    }
   
    const formattedVehicles = vehicles.map(vehicle => ({
      _id: vehicle._id.toString(),
      userId: vehicle.userId.toString(),
      fuel: vehicle.fuel,
      brandId: {
        _id: vehicle.brandId._id.toString(),
        status: vehicle.brandId.status,
        brandName: vehicle.brandId.brandName,
        imgeUrl: vehicle.brandId.imageUrl,
      },
      modelId: {
        _id: vehicle.modelId._id.toString(),
        name: vehicle.modelId.name,
        imageUrl:vehicle.modelId.imageUrl,
        status:vehicle.modelId.status,
        brandId:vehicle.modelId.brandId.toString(),
        fuelTypes:vehicle.modelId.fuelTypes,
      }
    }));

   return formattedVehicles
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return undefined
  }
}

}
