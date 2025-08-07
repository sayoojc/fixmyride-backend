import { IVehicle } from "../../models/vehicle.model";
import { IBaseRepository } from "./IBaseRepository";
import { IVehiclePopulated } from "../User.interface";

export interface IVehicleRepository extends IBaseRepository<IVehicle> {
  findVehicleDataPopulatedByUserId(userId: string): Promise<IVehiclePopulated[] | null>;
  findVehicleDataPopulatedById(id: string): Promise<IVehiclePopulated | null>;
}
