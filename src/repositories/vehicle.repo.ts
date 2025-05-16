import { BaseRepository } from "./base/base.repo";
import { IVehicle } from "../models/vehicle.model";
import { Model } from "mongoose";
import { IVehicleRepository } from "../interfaces/repositories/IVehicleRepository";

export class VehicleRepository extends BaseRepository<IVehicle> implements IVehicleRepository {
  constructor(private readonly vehicleModel: Model<IVehicle>) {
    super(vehicleModel);
  }
  async findVehicleDataPopulatedByUserId(userId:string) : Promise<IVehicle[] | null> {
   return  this.vehicleModel.find({userId:userId}).populate("brandId").populate("modelId")
  }
 
}
