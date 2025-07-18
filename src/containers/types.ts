export const TYPES = {
  // ========== REPOSITORIES ==========
  MailRepository: Symbol.for("MailRepository"),
  UserRepository: Symbol.for("UserRepository"),
  BrandRepository: Symbol.for("BrandRepository"),
  ModelRepository: Symbol.for("ModelRepository"),
  AddressRepository: Symbol.for("AddressRepository"),
  ProviderRepository: Symbol.for("ProviderRepository"),
  VerificationRepository: Symbol.for("VerificationRepository"),
  VehicleRepository: Symbol.for("VehicleRepository"),
  ServicePackageRepository: Symbol.for("ServicePackageRepository"),
  CartRepository: Symbol.for("CartRepository"),
  OrderRepository:Symbol.for("OrderRepository"),

  // ========== SERVICES ==========
  MailService: Symbol.for("MailService"),

  // User services
  UserAuthService: Symbol.for("UserAuthService"),
  UserProfileService: Symbol.for("UserProfileService"),
  UserBrandService: Symbol.for("UserBrandService"),
  UserAddressService: Symbol.for("UserAddressService"),
  UserVehicleService: Symbol.for("UserVehicleService"),
  UserServicePackageService: Symbol.for("UserServicePackageService"),
  UserCartService: Symbol.for("UserCartService"),
  UserOrderService:Symbol.for("UserOrderService"),

  // Admin services
  AdminAuthService: Symbol.for("AdminAuthService"),
  AdminBrandService: Symbol.for("AdminBrandService"),
  AdminModelService: Symbol.for("AdminModelService"),
  AdminUserService: Symbol.for("AdminUserService"),
  AdminProviderService: Symbol.for("AdminProviderService"),
  AdminServicePackageService: Symbol.for("AdminServicePackageService"),

  // Provider services
  ProviderAuthService: Symbol.for("ProviderAuthService"),
  ProviderProfileService: Symbol.for("ProviderProfileService"),

  //Socket service
  SocketService: Symbol.for("SocketService"),

  // ========== CONTROLLERS ==========

  // Admin controllers
  AdminAuthController: Symbol.for("AdminAuthController"),
  AdminBrandController: Symbol.for("AdminBrandController"),
  AdminModelController: Symbol.for("AdminModelController"),
  AdminUserController: Symbol.for("AdminUserController"),
  AdminProviderController: Symbol.for("AdminProviderController"),
  AdminServicePackageController: Symbol.for("AdminServicePackageController"),

  // User controllers
  UserAuthController: Symbol.for("UserAuthController"),
  UserProfileController: Symbol.for("UserProfileController"),
  UserBrandController: Symbol.for("UserBrandController"),
  UserAddressController: Symbol.for("UserAddressController"),
  UserVehicleController: Symbol.for("UserVehicleController"),
  UserServicePackageController: Symbol.for("UserServicePackageController"),
  UserCartController: Symbol.for("UserCartController"),
  UserOrderController:Symbol.for("UserOrderController"),

  // Provider controllers
  ProviderAuthController: Symbol.for("ProviderAuthController"),
  ProviderProfileController: Symbol.for("ProviderProfileController")
};
