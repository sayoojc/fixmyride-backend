import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IAdminServicePackageService } from "../../interfaces/services/admin/IAdminServicePackageService";
import {
  AddServicePackageRequestDTO,
  ToggleBlockStatusRequestDTO,
  UpdateServicePackageRequestDTO,
  ServicePackageDTO
} from "../../dtos/controllers/admin/adminServicePackageController.dto";
import { Types } from "mongoose";
import { IServicePackageRepository } from "../../interfaces/repositories/IServicePackageRepository";
import { IServicePackage } from "../../models/servicePackage.model";
@injectable()
export class AdminServicePackageService implements IAdminServicePackageService {
  constructor(
    @inject(TYPES.ServicePackageRepository)
    private readonly servicePackageRepository: IServicePackageRepository
  ) {}
  async addServicePackage(
    data: AddServicePackageRequestDTO
  ): Promise<ServicePackageDTO> {
    try {
      console.log('the add service package service function ');
      const servicePackageData = {
        ...data,
        brandId: new Types.ObjectId(data.brandId),
        modelId: new Types.ObjectId(data.modelId),
      };
      console.log('service package data from the service layer',servicePackageData);
      const newServicePackage = await this.servicePackageRepository.create(
        servicePackageData
      );
      const plainObject = newServicePackage.toObject();
     const sanitizedServicePackage: ServicePackageDTO = {
  title: plainObject.title,
  description: plainObject.description,
  brandId: plainObject.brandId.toString(),
  modelId: plainObject.modelId.toString(),
  fuelType: plainObject.fuelType,
  servicesIncluded: plainObject.servicesIncluded,
  servicePackageCategory: plainObject.servicePackageCategory,
  imageUrl:plainObject.imageUrl,
  priceBreakup: {
    parts: plainObject.priceBreakup.parts,
    laborCharge: plainObject.priceBreakup.laborCharge,
    discount: plainObject.priceBreakup.discount,
    tax: plainObject.priceBreakup.tax,
    total: plainObject.priceBreakup.total,
  },
};

return sanitizedServicePackage;
    } catch (error) {
      throw error;
    }
  }
  async getServicePackages({
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
    fuelFilter: string;
  }): Promise<{ servicePackages: IServicePackage[]; totalCount: number }> {
    try {
      const query:any = {};

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      const fuel = fuelFilter.toString();
      if (fuelFilter && fuelFilter !== "all") {
        query.fuelType = { $regex: fuel, $options: "i" };
      }
      if (statusFilter === "blocked") {
        query.isBlocked = true;
      } else if (statusFilter === "active") {
        query.isBlocked = false;
      }
      const totalCount = await this.servicePackageRepository.countDocuments(
        query
      );
      console.log("the total count from the service layer", totalCount);
      const servicePackages =
        await this.servicePackageRepository.findServicePackagesWithPopulate(
          query,
          skip,
          limit
        );
      console.log("the service pacckages", servicePackages);
      return { servicePackages, totalCount };
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
