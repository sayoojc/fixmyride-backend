import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IAdminServicePackageService } from "../../interfaces/services/admin/IAdminServicePackageService";
import {
  AddServicePackageRequestDTO,
  ToggleBlockStatusRequestDTO,
  UpdateServicePackageRequestDTO,
} from "../../dtos/controllers/admin/adminServicePackageController.dto";
import { Types } from "mongoose";
import { IServicePackageRepository } from "../../interfaces/repositories/IServicePackageRepository";
import { IServicePackage } from "../../models/servicePackage.model";
@injectable()
export class AdminServicePackageService implements IAdminServicePackageService {
  constructor(
   @inject(TYPES.ServicePackageRepository) private readonly servicePackageRepository: IServicePackageRepository
  ) {}
  async addServicePackage(
    data: AddServicePackageRequestDTO
  ): Promise<AddServicePackageRequestDTO> {
    try {
      const servicePackageData = {
        ...data,
        brandId: new Types.ObjectId(data.brandId),
        modelId: new Types.ObjectId(data.modelId),
      };
      const newServicePackage = await this.servicePackageRepository.create(
        servicePackageData
      );
      const sanitizedServicePackage = {
        ...newServicePackage,
        brandId: newServicePackage.brandId.toString(),
        modelId: newServicePackage.modelId.toString(),
      };
      return sanitizedServicePackage;
    } catch (error) {
      throw error;
    }
  }
  async getServicePackages(): Promise<IServicePackage[]> {
    try {
      const servicePackages =
        await this.servicePackageRepository.findServicePackagesWithPopulate();
      return servicePackages;
    } catch (error) {
      console.log("The catch block error", error);
      throw error;
    }
  }
  async updateServicePackage(
    data: UpdateServicePackageRequestDTO
  ): Promise<IServicePackage> {
    try {
      const refinedData = {
        ...data.data,
        brandId: new Types.ObjectId(data.data.brandId),
        modelId: new Types.ObjectId(data.data.modelId),
      };
      const updatedServicePackage =
        await this.servicePackageRepository.findOneAndUpdate(
          { _id: data.id },
          refinedData,
          { new: true }
        );
      if (!updatedServicePackage) {
        throw new Error("The update service package failed");
      }
      return updatedServicePackage;
    } catch (error) {
      throw error;
    }
  }
  async toggleBlockStatus(
    data: ToggleBlockStatusRequestDTO
  ): Promise<IServicePackage> {
    try {
      const status = data.actionType === "block" ? true : false;
      const updatedServicePackage =
        await this.servicePackageRepository.findOneAndUpdate(
          { _id: data.id },
          { isBlocked: status },
          { new: true }
        );
      if (!updatedServicePackage) {
        throw new Error("The toggle block unblock failed");
      }
      const refinedservicePackage = {
        ...updatedServicePackage.toObject(),
        brandId: updatedServicePackage.brandId.toString(),
        modelId: updatedServicePackage.modelId.toString(),
      };
      return refinedservicePackage;
    } catch (error) {
      throw error;
    }
  }
}
