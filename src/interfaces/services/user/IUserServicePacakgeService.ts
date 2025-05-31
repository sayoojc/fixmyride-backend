
import { IServicePackage } from "../../../models/servicePackage.model";
export interface IUserServicePackageService {
  getServicePackages(): Promise<IServicePackage[]>;
}
