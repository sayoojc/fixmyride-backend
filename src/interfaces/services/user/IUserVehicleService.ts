import { IVehicle } from "../../../models/vehicle.model";

export interface IUserVehicleService {
  addVehicle(
    userId: string,
    brandId: string,
    brandName: string,
    modelId: string,
    modelName: string,
    fuelType: string
  ): Promise<IVehicle | undefined>;
}
