import { Container } from "inversify";
import { TYPES } from "../types";

// Interfaces
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IAddressRepository } from "../../interfaces/repositories/IAddressRepository";
import { IBrandRepository } from "../../interfaces/repositories/IBrandRepository";
import { ICartRepository } from "../../interfaces/repositories/ICartRepository";
import { IMailRepository } from "../../interfaces/repositories/IMailRepository";
import { IModelRepository } from "../../interfaces/repositories/IModelRepository";
import { IProviderRepository } from "../../interfaces/repositories/IProviderRepository";
import { IServicePackageRepository } from "../../interfaces/repositories/IServicePackageRepository";
import { IVehicleRepository } from "../../interfaces/repositories/IVehicleRepository";
import { IVerificationRepository } from "../../interfaces/repositories/IVerificationRepository";

// Models
import userModel from "../../models/user.model";
import addressModel from "../../models/address.model";
import brandModel from "../../models/brand.model";
import cartModel from "../../models/cart.model";
import modelModel from "../../models/model.model";
import providerModel from "../../models/provider.model";
import servicePackageModel from "../../models/servicePackage.model";
import vehicleModel from "../../models/vehicle.model";
import verificationModel from "../../models/verification.model";

// Repositories
import { UserRepository } from "../../repositories/user.repo";
import { AddressRepository } from "../../repositories/address.repo";
import { BrandRepository } from "../../repositories/brand.repo";
import { CartRepository } from "../../repositories/cart.repo";
import { MailRepository } from "../../repositories/mail.repo";
import { ModelRepository } from "../../repositories/model.repo";
import { ProviderRepository } from "../../repositories/provider.repo";
import { ServicePackageRepository } from "../../repositories/servicePackage.repository";
import { VehicleRepository } from "../../repositories/vehicle.repo";
import { VerificationRepository } from "../../repositories/verification.repo";


export const bindRepositoriesModule = (container: Container) => {
  if (!container.isBound(TYPES.UserRepository)) {
    container.bind<IUserRepository>(TYPES.UserRepository)
      .toDynamicValue(() => new UserRepository(userModel))
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.AddressRepository)) {
    container.bind<IAddressRepository>(TYPES.AddressRepository)
      .toDynamicValue(() => new AddressRepository(addressModel))
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.BrandRepository)) {
    container.bind<IBrandRepository>(TYPES.BrandRepository)
      .toDynamicValue(() => new BrandRepository(brandModel))
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.CartRepository)) {
    container.bind<ICartRepository>(TYPES.CartRepository)
      .toDynamicValue(() => new CartRepository(cartModel))
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.MailRepository)) {
    container.bind<IMailRepository>(TYPES.MailRepository)
      .toDynamicValue(() => new MailRepository())
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.ModelRepository)) {
    container.bind<IModelRepository>(TYPES.ModelRepository)
      .toDynamicValue(() => new ModelRepository(modelModel))
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.ProviderRepository)) {
    container.bind<IProviderRepository>(TYPES.ProviderRepository)
      .toDynamicValue(() => new ProviderRepository(providerModel))
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.ServicePackageRepository)) {
    container.bind<IServicePackageRepository>(TYPES.ServicePackageRepository)
      .toDynamicValue(() => new ServicePackageRepository(servicePackageModel))
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.VehicleRepository)) {
    container.bind<IVehicleRepository>(TYPES.VehicleRepository)
      .toDynamicValue(() => new VehicleRepository(vehicleModel))
      .inSingletonScope();
  }

  if (!container.isBound(TYPES.VerificationRepository)) {
    container.bind<IVerificationRepository>(TYPES.VerificationRepository)
      .toDynamicValue(() => new VerificationRepository(verificationModel))
      .inSingletonScope();
  }
};
