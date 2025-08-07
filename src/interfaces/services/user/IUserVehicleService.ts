import { VehicleDTO } from "../../../dtos/controllers/user/userProfile.controller.dto";
import { EditVehicleRequestDTO } from "../../../dtos/controllers/user/userVehicle.controller.dto";
import { IVehicle } from "../../../models/vehicle.model";
export interface IUserVehicleService {
  addVehicle(
    userId: string,
    brandId: string,
    brandName: string,
    modelId: string,
    modelName: string,
    fuelType: string
  ): Promise<VehicleDTO | undefined>;
  getVehicle(id: string): Promise<VehicleDTO[] | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  editVehicle(
    id: string,
    brandId: string,
    fuel: string,
    modelId: string,
    isDefault: boolean
  ): Promise<VehicleDTO | undefined>;
}
