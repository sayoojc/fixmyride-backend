import { IServicePackageRepository } from "../../interfaces/repositories/IServicePackageRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IUserServicePackageService } from "../../interfaces/services/user/IUserServicePacakgeService";
import { IServicePackage } from "../../models/servicePackage.model";

@injectable()
export class UserServicePackageService implements IUserServicePackageService {
  constructor(
    @inject(TYPES.ServicePackageRepository)
    private readonly servicePackageRepository: IServicePackageRepository
  ) {}
  async getServicePackages(): Promise<IServicePackage[]> {
    try {
      const servicePackages =
        await this.servicePackageRepository.findServicePackagesWithPopulate("",-1,-1);
      return servicePackages;
    } catch (error) {
      console.log("The catch block error", error);
      throw error;
    }
  }
}
