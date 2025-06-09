import { IServicePackage } from "../../../models/servicePackage.model";
import {
  AddServicePackageRequestDTO,
  UpdateServicePackageRequestDTO,
  ToggleBlockStatusRequestDTO,
} from "../../../dtos/controllers/admin/adminServicePackageController.dto";
export interface IAdminServicePackageService {
  getServicePackages(): Promise<IServicePackage[]>;
  addServicePackage(
    data: AddServicePackageRequestDTO
  ): Promise<AddServicePackageRequestDTO>;
  updateServicePackage(
    data: UpdateServicePackageRequestDTO
  ): Promise<IServicePackage>;
  toggleBlockStatus(
    data: ToggleBlockStatusRequestDTO
  ): Promise<IServicePackage>;
}
