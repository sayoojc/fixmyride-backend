import { Container } from "inversify";

// === User Modules ===
import { bindUserAddressModule } from "./modules/user/address.module";
import { bindUserAuthModule } from "./modules/user/auth.module";
import { bindUserBrandModule } from "./modules/user/brand.module";
import { bindUserCartModule } from "./modules/user/cart.module";
import { bindUserProfileModule } from "./modules/user/profile.module";
import { bindUserServicePackageModule } from "./modules/user/servicePackage.module";
import { bindUserVehicleModule } from "./modules/user/vehicle.module";
import { bindUserOrderModule } from "./modules/user/order.module";
import { bindUserProviderModule } from "./modules/user/provider.module";
// === Admin Modules ===
import { bindAdminAuthModule } from "./modules/admin/auth.module";
import { bindAdminBrandModule } from "./modules/admin/brand.module";
import { bindAdminModelModule } from "./modules/admin/model.module";
import { bindAdminProviderModule } from "./modules/admin/provider.module";
import { bindAdminServicePackageModule } from "./modules/admin/servicePackage.module";
import { bindAdminUserModule } from "./modules/admin/user.module";
import { bindAdminOrderModule } from "./modules/admin/order.module";
import { bindAdminNotificationModule } from "./modules/admin/notification.module";

// === Provider Modules ===
import { bindProviderAuthModule } from "./modules/provider/auth.module";
import { bindProviderProfileModule } from "./modules/provider/profile.module";
import { bindProviderOrderModule } from "./modules/provider/order.module";
import { bindProviderSlotModule } from "./modules/provider/slot.module";


// === common services modules ===
import { bindCommonServiceModule } from "./modules/bindCommonServices.module";

// === repositories module === 

import { bindRepositoriesModule } from "./modules/repositories.module";
import { bindProviderNotificationModule } from "./modules/provider/notification.module";

// === Container Init ===
const container = new Container();

// === Bind Modules ===
// User
bindUserAddressModule(container);
bindUserAuthModule(container);
bindUserBrandModule(container);
bindUserCartModule(container);
bindUserProfileModule(container);
bindUserServicePackageModule(container);
bindUserVehicleModule(container);
bindUserOrderModule(container);
bindUserProviderModule(container);

// Admin
bindAdminAuthModule(container);
bindAdminBrandModule(container);
bindAdminModelModule(container);
bindAdminProviderModule(container);
bindAdminServicePackageModule(container);
bindAdminUserModule(container);
bindAdminOrderModule(container);
bindAdminNotificationModule(container);

// Provider
bindProviderAuthModule(container);
bindProviderProfileModule(container);
bindProviderOrderModule(container);
bindProviderNotificationModule(container);
bindProviderSlotModule(container);

//common services
bindCommonServiceModule(container);

//repositories
bindRepositoriesModule(container);

export default container;
