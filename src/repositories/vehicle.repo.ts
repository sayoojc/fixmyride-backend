import { BaseRepository } from "./base/base.repo";
import { IVehicle } from "../models/vehicle.model";
import { Model } from "mongoose";

export class VehicleRepository extends BaseRepository<IVehicle> {
  constructor(private readonly vehicleModel: Model<IVehicle>) {
    super(vehicleModel);
  }
  async findVehicleDataPopulatedByUserId(userId:string) : Promise<IVehicle[] | null> {
   return  this.vehicleModel.find({userId:userId}).populate("brandId").populate("modelId")
  }
 
}
