import { IServicePackage } from "../../../models/servicePackage.model";
import {
  AddServicePackageRequestDTO,
  ServicePackageDTO
} from "../../../dtos/controllers/admin/adminServicePackageController.dto";
import { UpdateServicepackageServiceDTO,ToggleBlockServicePackageServiceDTO } from "../../../dtos/services/admin/servicePackage.service.dto";
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
    data: UpdateServicepackageServiceDTO
  ): Promise<ServicePackageDTO>;
  toggleBlockStatus(
    data: ToggleBlockServicePackageServiceDTO
  ): Promise<IServicePackage>;
}
