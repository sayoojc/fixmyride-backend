import { VehicleDTO } from "../../../dtos/controllers/user/userProfile.controller.dto";

export interface IUserVehicleService {
  addVehicle(
    userId: string,
    brandId: string,
    brandName: string,
    modelId: string,
    modelName: string,
    fuelType: string
  ): Promise<VehicleDTO | undefined>;
  getVehicle(id:string):Promise<VehicleDTO[] | undefined>
}
