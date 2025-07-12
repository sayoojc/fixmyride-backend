import { IServicePackageRepository } from "../../interfaces/repositories/IServicePackageRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IUserServicePackageService } from "../../interfaces/services/user/IUserServicePacakgeService";
import { IServicePackage } from "../../models/servicePackage.model";
import { Types } from "mongoose";
@injectable()
export class UserServicePackageService implements IUserServicePackageService {
  constructor(
    @inject(TYPES.ServicePackageRepository)
    private readonly _servicePackageRepository: IServicePackageRepository
  ) {}
  async getServicePackages(vehicleId:string,serviceCategory:string,fuelType:string): Promise<IServicePackage[]> {
    try {
      const page = 1;
      const limit = 25;
      const skip = (page - 1) * limit;
      const query:any = {};
      query.servicePackageCategory = serviceCategory;
      query.fuelType = fuelType;
      query.modelId  = new Types.ObjectId(vehicleId);
      query.isBlocked = false;
      const servicePackages =
      await this._servicePackageRepository.findServicePackagesWithPopulate(query,skip,limit);
      return servicePackages;
    } catch (error) {
      console.log("The catch block error", error);
      throw error;
    }
  }
}
