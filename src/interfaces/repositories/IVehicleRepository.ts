import { IVehicle } from "../../models/vehicle.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IVehicleRepository extends IBaseRepository<IVehicle> {
  findVehicleDataPopulatedByUserId(userId: string): Promise<IVehicle[] | null>;
}
