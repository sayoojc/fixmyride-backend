
import { IServicePackage } from "../../../models/servicePackage.model";
export interface IUserServicePackageService {
  getServicePackages(vehicleId:string,serviceCategory:string,fuelType:string): Promise<IServicePackage[]>;
}
