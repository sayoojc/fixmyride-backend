import { IServicePackage } from "../../../models/servicePackage.model";
import {
  AddServicePackageRequestDTO,
  UpdateServicePackageRequestDTO,
  ToggleBlockStatusRequestDTO,
} from "../../../dtos/controllers/admin/adminServicePackageController.dto";
export interface IAdminServicePackageService {
  getServicePackages({
    search,
    skip,
    limit,
    statusFilter,
    fuelFilter,
  }: {
    search: string;
    skip: number;
    limit: number;
    statusFilter: string;
    fuelFilter:string;
  }): Promise<{ servicePackages: IServicePackage[]; totalCount: number }>;
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
