import { IServicePackage } from "../../../models/servicePackage.model";
import { AddServicePackageRequestDTO } from "../../../dtos/controllers/admin/adminServicePackageController.dto";
export interface IAdminServicePackageService {
  getServicePackages(): Promise<IServicePackage[]>;
  addServicePackage(data:AddServicePackageRequestDTO):Promise<AddServicePackageRequestDTO>
}

