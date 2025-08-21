import { Admin } from "mongodb";

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
  NotificationRepository:Symbol.for("NotificationRepository"),
  ServiceRequestRepository:Symbol.for("ServiceRequestRepository"),
  SlotRepository:Symbol.for("SlotRepository"),

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
  UserProviderService: Symbol.for("UserProviderService"),

  // Admin services
  AdminAuthService: Symbol.for("AdminAuthService"),
  AdminBrandService: Symbol.for("AdminBrandService"),
  AdminModelService: Symbol.for("AdminModelService"),
  AdminUserService: Symbol.for("AdminUserService"),
  AdminProviderService: Symbol.for("AdminProviderService"),
  AdminServicePackageService: Symbol.for("AdminServicePackageService"),
  AdminOrderService:Symbol.for("AdminOrderService"),
  AdminNotificationService: Symbol.for("AdminNotificationService"),

  // Provider services
  ProviderAuthService: Symbol.for("ProviderAuthService"),
  ProviderProfileService: Symbol.for("ProviderProfileService"),
  ProviderOrderService: Symbol.for("ProviderOrderService"),
  ProviderNotificationService: Symbol.for("ProviderNotificationService"),
  ProviderSlotService:Symbol.for("ProviderSlotService"),

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
  AdminOrderController: Symbol.for("AdminOrderController"),
  AdminNotificationController: Symbol.for("AdminNotificationController"),

  // User controllers
  UserAuthController: Symbol.for("UserAuthController"),
  UserProfileController: Symbol.for("UserProfileController"),
  UserBrandController: Symbol.for("UserBrandController"),
  UserAddressController: Symbol.for("UserAddressController"),
  UserVehicleController: Symbol.for("UserVehicleController"),
  UserServicePackageController: Symbol.for("UserServicePackageController"),
  UserCartController: Symbol.for("UserCartController"),
  UserOrderController:Symbol.for("UserOrderController"),
  UserProviderController: Symbol.for("UserProviderController"),

  // Provider controllers
  ProviderAuthController: Symbol.for("ProviderAuthController"),
  ProviderProfileController: Symbol.for("ProviderProfileController"),
  ProviderOrderController: Symbol.for("ProviderOrderController"),
  ProviderNotificationController:Symbol.for("ProviderNotificationController"),
  ProviderSlotController:Symbol.for("ProviderSlotController"),

};
