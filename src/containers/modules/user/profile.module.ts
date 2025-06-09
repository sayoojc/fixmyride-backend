import { Container } from "inversify";
import { TYPES } from "../../types";

import { UserProfileController } from "../../../controllers/user/profile.controller";
import { UserProfileService } from "../../../services/user/profile.service";

import { IUserProfileController } from "../../../interfaces/controllers/user/IUserProfileController";
import { IUserProfileService } from "../../../interfaces/services/user/IUserProfileService";

import { IUserRepository } from "../../../interfaces/repositories/IUserRepository";
import { IAddressRepository } from "../../../interfaces/repositories/IAddressRepository";
import { IVehicleRepository } from "../../../interfaces/repositories/IVehicleRepository";


export const bindUserProfileModule = (container: Container) => {
  container
    .bind<IUserProfileService>(TYPES.UserProfileService)
    .toDynamicValue(() => {
      const userRepo = container.get<IUserRepository>(TYPES.UserRepository);
      const addressRepo = container.get<IAddressRepository>(TYPES.AddressRepository);
      const vehicleRepo = container.get<IVehicleRepository>(TYPES.VehicleRepository);
      return new UserProfileService(userRepo, addressRepo, vehicleRepo);
    })
    .inSingletonScope();

  container
    .bind<IUserProfileController>(TYPES.UserProfileController)
    .to(UserProfileController)
    .inSingletonScope();
};
