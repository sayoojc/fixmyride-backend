import { inject,injectable } from "inversify";
import {TYPES} from '../../containers/types'
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IAddressRepository } from "../../interfaces/repositories/IAddressRepository";
import { IVehicleRepository } from "../../interfaces/repositories/IVehicleRepository";
import { formatAddress } from "../../utils/address";
import bcrypt from "bcrypt";
import { IUserProfileService } from "../../interfaces/services/user/IUserProfileService";
import {IVehiclePopulated,SanitizedUser,UserProfileDTO} from "../../interfaces/User.interface"
import {PartialSanitizedUserDTO,} from '../../dtos/controllers/user/userProfile.controller.dto'

injectable()
export class UserProfileService implements IUserProfileService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
    @inject(TYPES.AddressRepository) private readonly addressRepository: IAddressRepository,
    @inject(TYPES.VehicleRepository) private readonly vehicleRepository: IVehicleRepository
  ) {}
  async getProfileData(id: string): Promise<UserProfileDTO | undefined> {
    try {
      const user = await this.userRepository.findOne({ _id: id });
      const addresses = await this.addressRepository.find({ userId: id });
      const defaultAddressObject = addresses.find(
        (address) => address.isDefault === true
      );
      const defaultAddress = defaultAddressObject
        ? formatAddress(defaultAddressObject)
        : "";
      const vehicles =
        await this.vehicleRepository.findVehicleDataPopulatedByUserId(user?.id);
      if (!user) {
        throw new Error("User details not found");
      }
      const sanitizedUser = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isListed: user.isListed,
        provider: user.provider,
        addresses: addresses,
        defaultAddress,
        vehicles: vehicles ?? [],
      };
      return sanitizedUser;
    } catch (error) {
      console.error("Error fetching users:", error);
      return undefined;
    }
  }
 async updateProfile(
  phone: string,
  userId: string,
  userName: string
): Promise<PartialSanitizedUserDTO> {
  const user = await this.userRepository.findOneAndUpdate(
    { _id: userId },
    { phone, name: userName }
  );

  if (!user || !user.name) {
    throw new Error("User details not found or name missing");
  }
  return {
    name: user.name,
    phone: user.phone,
  };
}

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<PartialSanitizedUserDTO | undefined> {
    try {
      const user = await this.userRepository.findOne({ _id: userId });
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.password) {
        throw new Error("Password is not set for this user");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      if(!user || !user.name){
        throw new Error("Password updation failed")
      }
      const sanitizedUser: PartialSanitizedUserDTO= {
        name: user.name,
        phone: user.phone,
      };

      return sanitizedUser;
    } catch (error) {
      console.error("Error fetching users:", error);
      return undefined;
    }
  }
}
