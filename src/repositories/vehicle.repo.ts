import { BaseRepository } from "./base/base.repo";
import { IVehicle } from "../models/vehicle.model";
import { Model } from "mongoose";
import { IVehicleRepository } from "../interfaces/repositories/IVehicleRepository";
import { IVehiclePopulated } from "../interfaces/User.interface";

export class VehicleRepository extends BaseRepository<IVehicle> implements IVehicleRepository {
  constructor(private readonly vehicleModel: Model<IVehicle>) {
    super(vehicleModel);
  }
  async findVehicleDataPopulatedByUserId(userId:string) : Promise<IVehiclePopulated[] | null> {
return this.vehicleModel
    .find({ userId })
    .populate("brandId")
    .populate("modelId")
    .lean<IVehiclePopulated[]>()
    .exec();  }
 
}
