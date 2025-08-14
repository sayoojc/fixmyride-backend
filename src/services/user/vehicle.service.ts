import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IVehicleRepository } from "../../interfaces/repositories/IVehicleRepository";
import mongoose from "mongoose";
import { IUserVehicleService } from "../../interfaces/services/user/IUserVehicleService";
import { VehicleDTO } from "../../dtos/controllers/user/userProfile.controller.dto";
import { EditVehicleRequestDTO } from "../../dtos/controllers/user/userVehicle.controller.dto";
import { IVehicle } from "../../models/vehicle.model";

@injectable()
export class UserVehicleService implements IUserVehicleService {
  constructor(
    @inject(TYPES.VehicleRepository)
    private readonly _vehicleRepository: IVehicleRepository
  ) {}
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
      const vehicle = await this._vehicleRepository.create({
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
          brandId: string;
          fuelTypes: string[];
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
      const vehicles =
        await this._vehicleRepository.findVehicleDataPopulatedByUserId(id);
       console.log('the vehicles fetched from the service layer',vehicles);
      if (!vehicles) {
        throw new Error("vehicle fetching failed");
      }

      const formattedVehicles = vehicles.map((vehicle) => ({
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
          imageUrl: vehicle.modelId.imageUrl,
          status: vehicle.modelId.status,
          brandId: vehicle.modelId.brandId.toString(),
          fuelTypes: vehicle.modelId.fuelTypes,
        },
      }));

      return formattedVehicles;
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      return undefined;
    }
  }
  async deleteVehicle(id: string): Promise<boolean> {
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const result = await this._vehicleRepository.deleteById(objectId);
      return result;
    } catch (error) {
      return false;
    }
  }
  async editVehicle(
    id: string,
    brandId: string,
    fuel: string,
    modelId: string,
    isDefault: boolean
  ): Promise<VehicleDTO | undefined> {
    try {
      const vehicleId = new mongoose.Types.ObjectId(id);
      const brandObjectId = new mongoose.Types.ObjectId(brandId);
      const modelObjectId = new mongoose.Types.ObjectId(modelId);
      const vehicle = await this._vehicleRepository.updateById(vehicleId, {
        brandId: brandObjectId,
        modelId: modelObjectId,
        isDefault,
        fuel,
      });
      if(!vehicle){
return undefined;

      } 
      const updatedVehicle = await this._vehicleRepository.findVehicleDataPopulatedById(vehicle._id.toString()); 
      if(!updatedVehicle){
 return undefined  
      }  
      return {
        _id: updatedVehicle._id.toString(),
        userId: updatedVehicle.userId.toString(),
        fuel: updatedVehicle.fuel,
        brandId: {
          _id: updatedVehicle.brandId._id.toString(),
          status: updatedVehicle.brandId.status,
          brandName: updatedVehicle.brandId.brandName,
          imgeUrl: updatedVehicle.brandId.imageUrl,
        },
        modelId: {
          _id: updatedVehicle.modelId._id.toString(),
          name: updatedVehicle.modelId.name,
          imageUrl: updatedVehicle.modelId.imageUrl,
          status: updatedVehicle.modelId.status,
          brandId: updatedVehicle.modelId.brandId.toString(),
          fuelTypes: updatedVehicle.modelId.fuelTypes,
        },
      }
    } catch (error) {
      console.log('the catch block hits from the vehicle service layer');
      return undefined;
    }
  }
}
