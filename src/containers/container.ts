import { Container } from "inversify";


import { AdminBrandService } from "../services/admin/brand.service";
import { AdminModelService } from "../services/admin/model.service";
import { UserAddressService } from "../services/user/address.service";
import { UserBrandService } from "../services/user/brand.service";
import { UserProfileController } from "../controllers/user/profile.controller";
import { AdminAuthController } from "../controllers/admin/auth.controller";
import { UserAuthController } from "../controllers/user/auth.controller";
import { ProviderAuthController } from "../controllers/provider/auth.controller";
import { ProviderProfileController } from "../controllers/provider/profile.controller";
import { ProviderProfileService } from "../services/provider/profile.service";
import { UserCartController } from "../controllers/user/cart.controller";
import { UserCartService } from "../services/user/cart.service";
import { ProviderAuthService } from "../services/provider/auth.service";
import { UserAuthService } from "../services/user/auth.services";
import { AdminAuthService } from "../services/admin/auth.services";
import { UserProfileService } from "../services/user/profile.service";
import { UserBrandController } from "../controllers/user/brand.controller";
import { UserAddressController } from "../controllers/user/address.controller";
import { AdminBrandController } from "../controllers/admin/brand.controller";
import { AdminModelController } from "../controllers/admin/model.controller";
import { AdminProviderController } from "../controllers/admin/provider.controller";
import { UserVehicleController } from "../controllers/user/vehicle.controller";
import { AdminServicePackageController } from "../controllers/admin/servicePackage.controller";

import { UserServicePackageController } from "../controllers/user/servicePackage.controller";
import { AdminServicePackageService } from "../services/admin/servicePackage.service";
import { UserVehicleService } from "../services/user/vehicle.service";
import { AdminProviderService } from "../services/admin/provider.service";
import { MailService } from "../services/mail.service";
import { MailRepository } from "../repositories/mail.repo";
import { UserRepository } from "../repositories/user.repo";
import { BrandRepository } from "../repositories/brand.repo";
import { AddressRepository } from "../repositories/address.repo";
import { ProviderRepository } from "../repositories/provider.repo";
import { VerificationRepository } from "../repositories/verification.repo";
import { CartRepository } from "../repositories/cart.repo";

import { VerificationModel } from "../models/verification.model";
import ProviderModel from '../models/provider.model'
import UserModel from "../models/user.model";
import BrandModel from "../models/brand.model";
import modelModel from "../models/model.model";
import addressModel from "../models/adress.model";
import vehicleModel from "../models/vehicle.model";
import servicePackageModel from "../models/servicePackage.model";
import { ModelRepository } from "../repositories/model.repo";
import { AdminUserService } from "../services/admin/user.service";
import { AdminUserController } from "../controllers/admin/user.controller";
import { VehicleRepository } from "../repositories/vehicle.repo";
import { ServicePackageRepository } from "../repositories/servicePackage.repository";
import { UserServicePackageService } from "../services/user/servicePackage.service";
import cartModel from "../models/cart.model";

// /// interfaces////
// import { TYPES } from "./types";
// import { IMailRepository } from "../interfaces/repositories/IMailRepository";

const container = new Container();


container.bind<MailRepository>(MailRepository).toConstantValue(new MailRepository());
container.bind<UserRepository>(UserRepository).toConstantValue(new UserRepository(UserModel));
container.bind<BrandRepository>(BrandRepository).toConstantValue(new BrandRepository(BrandModel));
container.bind<ModelRepository>(ModelRepository).toConstantValue(new ModelRepository(modelModel));
container.bind<AddressRepository>(AddressRepository).toConstantValue(new AddressRepository(addressModel));
container.bind<ProviderRepository>(ProviderRepository).toConstantValue(new ProviderRepository(ProviderModel));
container.bind<VerificationRepository>(VerificationRepository).toConstantValue(new VerificationRepository(VerificationModel));
container.bind<VehicleRepository>(VehicleRepository).toConstantValue(new VehicleRepository(vehicleModel));
container.bind<ServicePackageRepository>(ServicePackageRepository).toConstantValue(new ServicePackageRepository(servicePackageModel))
container.bind<CartRepository>(CartRepository).toConstantValue(new CartRepository(cartModel))

container.bind<UserAuthService>(UserAuthService).toDynamicValue(() => {
  const userRepo = container.get<UserRepository>(UserRepository);
  return new UserAuthService(userRepo);
})

container.bind<UserProfileService>(UserProfileService).toDynamicValue(() => {
  const addressRepo = container.get<AddressRepository>(AddressRepository);
  const userRepo = container.get<UserRepository>(UserRepository);
  const vehicleRepo = container.get<VehicleRepository>(VehicleRepository)
  return new UserProfileService(userRepo,addressRepo,vehicleRepo);
})

container.bind<UserBrandService>(UserBrandService).toDynamicValue(() => {
  const modelRepo = container.get<ModelRepository>(ModelRepository);
  const brandRepo = container.get<BrandRepository>(BrandRepository);
  return new UserBrandService(brandRepo,modelRepo)
})

container.bind<UserAddressService>(UserAddressService).toDynamicValue(() => {
  const addressRepo = container.get<AddressRepository>(AddressRepository);
  const userRepo = container.get<UserRepository>(UserRepository);
  return new UserAddressService(userRepo,addressRepo);
})

container.bind<UserVehicleService>(UserVehicleService).toDynamicValue(() => {
    const userRepo = container.get<UserRepository>(UserRepository);
    const vehicleRepo = container.get<VehicleRepository>(VehicleRepository);
    return new UserVehicleService(vehicleRepo);
});

container.bind<UserServicePackageService>(UserServicePackageService).toDynamicValue(() => {
  const servicePackageRepo = container.get<ServicePackageRepository>(ServicePackageRepository);
  return new UserServicePackageService(servicePackageRepo);
});

container.bind<UserCartService>(UserCartService).toDynamicValue(() => {
  const cartRepo = container.get<CartRepository>(CartRepository);
  return new UserCartService(cartRepo);
})

container.bind<AdminAuthService>(AdminAuthService).toDynamicValue(() => {
  const userRepo = container.get<UserRepository>(UserRepository);
  return new AdminAuthService(userRepo);
})

container.bind<AdminBrandService>(AdminBrandService).toDynamicValue(() => {
  const brandRepo = container.get<BrandRepository>(BrandRepository);
  const modelRepo = container.get<ModelRepository>(ModelRepository);
  return new AdminBrandService(brandRepo,modelRepo)
})

container.bind<AdminModelService>(AdminModelService).toDynamicValue(() => {
  const modelRepo = container.get<ModelRepository>(ModelRepository);
  return new AdminModelService(modelRepo);
})

container.bind<AdminUserService>(AdminUserService).toDynamicValue(() => {
  const userRepo = container.get<UserRepository>(UserRepository);
  return new AdminUserService(userRepo);
})

container.bind<AdminProviderService>(AdminProviderService).toDynamicValue(() => {
  const providerRepo = container.get<ProviderRepository>(ProviderRepository);
  const verificationRepo = container.get<VerificationRepository>(VerificationRepository);
  const mailService = container.get<MailService>(MailService)
  return new AdminProviderService(providerRepo,verificationRepo,mailService);
})

container.bind<AdminServicePackageService>(AdminServicePackageService).toDynamicValue(() => {
  const servicePackageRepo = container.get<ServicePackageRepository>(ServicePackageRepository);
  return new AdminServicePackageService(servicePackageRepo)
})

container.bind<ProviderAuthService>(ProviderAuthService).toDynamicValue(() => {
  const providerRepo = container.get<ProviderRepository>(ProviderRepository);
  return new ProviderAuthService(providerRepo);
})

container.bind<ProviderProfileService>(ProviderProfileService).toDynamicValue(() =>{
  const providerRepo = container.get<ProviderRepository>(ProviderRepository);
  const verificationRepo = container.get<VerificationRepository>(VerificationRepository);
  return new ProviderProfileService(providerRepo,verificationRepo);
})


container.bind<MailService>(MailService).toSelf();

container.bind<AdminBrandController>(AdminBrandController).toSelf();
container.bind<AdminModelController>(AdminModelController).toSelf();
container.bind<AdminUserController>(AdminUserController).toSelf();
container.bind<AdminAuthController>(AdminAuthController).toSelf();
container.bind<AdminProviderController>(AdminProviderController).toSelf();
container.bind<AdminServicePackageController>(AdminServicePackageController).toSelf();

container.bind<UserAddressController>(UserAddressController).toSelf();
container.bind<UserBrandController>(UserBrandController).toSelf();
container.bind<UserProfileController>(UserProfileController).toSelf();
container.bind<UserAuthController>(UserAuthController).toSelf();
container.bind<UserVehicleController>(UserVehicleController).toSelf();
container.bind<UserServicePackageController>(UserServicePackageController).toSelf();
container.bind<UserCartController>(UserCartController).toSelf();

container.bind<ProviderAuthController>(ProviderAuthController).toSelf();
container.bind<ProviderProfileController>(ProviderProfileController).toSelf();

export default container;
