import { BaseRepository } from "./base/base.repo";
import { IVehicle } from "../models/vehicle.model";
import { Model } from "mongoose";

export class VehicleRepository extends BaseRepository<IVehicle> {
  constructor(vehicleModel: Model<IVehicle>) {
    super(vehicleModel);
  }

  async findVehiclesByUserId(userId: string): Promise<IVehicle[]> {
    return this.find({ userId });
  }

  async findVehicleByRegistration(registrationNumber: string): Promise<IVehicle | null> {
    return this.findOne({ registrationNumber });
  }

  async createVehicle(vehicleData: Partial<IVehicle>): Promise<IVehicle> {
    return this.create(vehicleData);
  }

  async updateVehicle(vehicleId: string, updateData: Partial<IVehicle>): Promise<IVehicle | null> {
    return this.updateById(vehicleId, updateData);
  }

  async deleteVehicle(vehicleId: string): Promise<void> {
     this.deleteById(vehicleId);
  }
}
