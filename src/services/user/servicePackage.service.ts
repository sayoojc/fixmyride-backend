import { ServicePackageRepository } from "../../repositories/servicePackage.repository";
import mongoose from "mongoose";
import { IUserServicePackageService } from "../../interfaces/services/user/IUserServicePacakgeService";
import { IServicePackage } from "../../models/servicePackage.model";
export class UserServicePackageService implements IUserServicePackageService {
  constructor(private servicePackageRepository: ServicePackageRepository) {}
  async getServicePackages():Promise<IServicePackage[]>{
    try {
     const servicePackages = await this.servicePackageRepository.findServicePackagesWithPopulate();
    return servicePackages;
    } catch (error) {
      console.log('The catch block error',error)
      throw error;
    }
  }
}
