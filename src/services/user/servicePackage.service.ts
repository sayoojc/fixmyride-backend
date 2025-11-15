import { IServicePackageRepository } from "../../interfaces/repositories/IServicePackageRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IUserServicePackageService } from "../../interfaces/services/user/IUserServicePacakgeService";
import { IServicePackage } from "../../models/servicePackage.model";
import { FilterQuery } from "mongoose";
import { Types } from "mongoose";
@injectable()
export class UserServicePackageService implements IUserServicePackageService {
  constructor(
    @inject(TYPES.ServicePackageRepository)
    private readonly _servicePackageRepository: IServicePackageRepository
  ) {}
async getServicePackages(
  vehicleId: string,
  serviceCategory: string,
  fuelType: string
): Promise<IServicePackage[]> {
  try {
    const page = 1;
    const limit = 25;
    const skip = (page - 1) * limit;

    const query: FilterQuery<IServicePackage> = {
      servicePackageCategory: serviceCategory,
      isBlocked: false,
    };

    // only add filters if NOT emergency
    if (serviceCategory !== "emergency") {
      query.fuelType = fuelType;
      query.modelId = new Types.ObjectId(vehicleId);
    } else {
      query.isEmergency = true;
    }

    const servicePackages =
      await this._servicePackageRepository.findServicePackagesWithPopulate(
        query,
        skip,
        limit
      );

    return servicePackages;
  } catch (error) {
    throw error;
  }
}
async getServicePackageById(id: string): Promise<IServicePackage | null> {
  try {
    const servicePackage =
      await this._servicePackageRepository.findServicePackageByIdWithPopulate(
        id
      );
    return servicePackage;
  } catch (error) {
    throw error;
  } 
}
}
