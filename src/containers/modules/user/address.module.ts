import { Container } from "inversify";
import { UserAddressController } from "../../../controllers/user/address.controller";
import { UserAddressService } from "../../../services/user/address.service";
import { IUserAddressService } from "../../../interfaces/services/user/IUserAddressService";
import { IUserAddressController } from "../../../interfaces/controllers/user/IUserAddressController";
import { IAddressRepository } from "../../../interfaces/repositories/IAddressRepository";
import { IUserRepository } from "../../../interfaces/repositories/IUserRepository";
import { TYPES } from "../../types";

export const bindUserAddressModule = (container: Container) => {
  container
    .bind<IUserAddressService>(TYPES.UserAddressService)
    .toDynamicValue(() => {
      const userRepo = container.get<IUserRepository>(TYPES.UserRepository);
      const addressRepo = container.get<IAddressRepository>(
        TYPES.AddressRepository
      );
      return new UserAddressService(userRepo, addressRepo);
    })
    .inSingletonScope();
  container
    .bind<IUserAddressController>(TYPES.UserAddressController)
    .to(UserAddressController)
    .inSingletonScope();
};
