import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IAdminServicePackageService } from "../../interfaces/services/admin/IAdminServicePackageService";
import {
  AddServicePackageRequestDTO,
  ServicePackageDTO
} from "../../dtos/controllers/admin/adminServicePackageController.dto";
import { ToggleBlockServicePackageServiceDTO, UpdateServicepackageServiceDTO } from "../../dtos/services/admin/servicePackage.service.dto";
import { FilterQuery, Types } from "mongoose";
import { IServicePackageRepository } from "../../interfaces/repositories/IServicePackageRepository";
import { IServicePackage } from "../../models/servicePackage.model";
@injectable()
export class AdminServicePackageService implements IAdminServicePackageService {
  constructor(
    @inject(TYPES.ServicePackageRepository)
    private readonly _servicePackageRepository: IServicePackageRepository
  ) {}
  async addServicePackage(
    data: AddServicePackageRequestDTO
  ): Promise<ServicePackageDTO> {
    try {
      let servicePackageData
      if(data.servicePackageCategory !== "emergency"){
          servicePackageData = {
        ...data,
        brandId: new Types.ObjectId(data.brandId),
        modelId: new Types.ObjectId(data.modelId),
       
      };
      } else {
        servicePackageData = {...data,modelId :undefined,brandId:undefined,isEmergency:true}
      }  
      const newServicePackage = await this._servicePackageRepository.create(
        servicePackageData
      );
      const plainObject = newServicePackage.toObject();
     const sanitizedServicePackage: ServicePackageDTO = {
  title: plainObject.title,
  description: plainObject.description,
  brandId: plainObject.brandId?plainObject.brandId.toString():plainObject.brandId,
  modelId: plainObject.modelId?plainObject.modelId.toString():plainObject.modelId,
  fuelType: plainObject.fuelType,
  servicesIncluded: plainObject.servicesIncluded,
  workHours:plainObject.workHours,
  numberOfEmployees:plainObject.numberOfEmployees,
  isEmergency:plainObject.isEmergency,
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
      const query:FilterQuery<IServicePackage> = {};

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
      let totalCount = await this._servicePackageRepository.countDocuments(
        query
      );
      totalCount = Math.ceil(totalCount/limit)
      const servicePackages =
        await this._servicePackageRepository.findServicePackagesWithPopulate(
          query,
          skip,
          limit
        );
      return { servicePackages, totalCount };
    } catch (error) {
      throw error;
    }
  }
  async updateServicePackage(
    data: UpdateServicepackageServiceDTO
  ): Promise<ServicePackageDTO> {
    try {
      
      const refinedData = {
        ...data.data,
        brandId:data.data.brandId ? new Types.ObjectId(data.data.brandId) : undefined,
        modelId:data.data.modelId ? new Types.ObjectId(data.data.modelId) : undefined,
      };
      const updatedServicePackage =
        await this._servicePackageRepository.findOneAndUpdate(
          { _id: data.id },
          refinedData,
          { new: true }
        );
      if (!updatedServicePackage) {
        throw new Error("The update service package failed");
      }
           const plainObject = updatedServicePackage.toObject();
     const sanitizedServicePackage: ServicePackageDTO & {_id:string} = {
      _id:plainObject._id,
  title: plainObject.title,
  description: plainObject.description,
  brandId: plainObject.brandId ? plainObject.brandId.toString() : plainObject.brandId,
  modelId: plainObject.modelId ? plainObject.modelId.toString() : plainObject.modelId,
  fuelType: plainObject.fuelType,
  servicesIncluded: plainObject.servicesIncluded,
  workHours:plainObject.workHours,
  numberOfEmployees:plainObject.numberOfEmployees,
  servicePackageCategory: plainObject.servicePackageCategory,
  imageUrl:plainObject.imageUrl,
  isEmergency:plainObject.isEmergency,
  emergencyServiceFee:plainObject.emergencyServiceFee,
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
  async toggleBlockStatus(
    data: ToggleBlockServicePackageServiceDTO
  ): Promise<IServicePackage> {
    try {
      const status = data.actionType === "block" ? true : false;
      const updatedServicePackage =
        await this._servicePackageRepository.findOneAndUpdate(
          { _id: data.id },
          { isBlocked: status },
          { new: true }
        );
      if (!updatedServicePackage) {
        throw new Error("The toggle block unblock failed");
      }
      const refinedservicePackage = {
        ...updatedServicePackage.toObject(),
        brandId: updatedServicePackage.brandId ? updatedServicePackage.brandId.toString() : "",
        modelId: updatedServicePackage.modelId ? updatedServicePackage.modelId.toString() : "",
      };
      return refinedservicePackage;
    } catch (error) {
      throw error;
    }
  }
}
