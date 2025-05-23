import { UserRepository } from "../../repositories/user.repo";
import { IAddress } from "../../models/adress.model";
import { AddressRepository } from "../../repositories/address.repo";
import mongoose from "mongoose";
import { IUserAddressService } from "../../interfaces/services/user/IUserAddressService";
import { Types } from "mongoose";
import {
  AddressSchema,
  AddAddressRequestDTO,
  UpdateAddressRequestDTO,
  SetDefaultAddressRequestDTO,
  DeleteAddressRequestDTO,
  AddressResponseDTO,
  SuccessResponse,
  ErrorResponse,
} from "../../dtos/controllers/user/userAddress.controller.dto";

export class UserAddressService implements IUserAddressService {
  constructor(
    private userRepository: UserRepository,
    private addressRepository: AddressRepository
  ) {}
  async addAddress(
    addressData: AddAddressRequestDTO
  ): Promise<AddressResponseDTO> {
    try {
      const newAddress = await this.addressRepository.create({
        ...addressData,
        userId: new Types.ObjectId(addressData.userId),
      });
      const addressObj = newAddress.toObject();

      const response: AddressResponseDTO = {
        ...addressObj,
        _id: addressObj._id.toString(),
        userId: addressObj.userId.toString(),
      };

      return response;
    } catch (error) {
      throw new Error("Adding address is failed");
    }
  }
  async setDefaultAddress(addressId: string, userId: string): Promise<void> {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(addressId)
    ) {
      throw new Error("Invalid userId or addressId");
    }
    const targetAddress = await this.addressRepository.findOne({
      _id: addressId,
      userId: userId,
    });

    if (!targetAddress) {
      throw new Error("Address not found");
    }

    const updatedAddress = await this.addressRepository.updateById(new Types.ObjectId(addressId), {
      isDefault: true,
    });

    const addresses = await this.addressRepository.updateMany(
      {
        userId: userId,
        _id: { $ne: addressId },
        isDefault: true,
      },
      {
        isDefault: false,
      }
    );

    if (!updatedAddress) {
      throw new Error("Failed to set default address");
    }
  }
  async updateAddress(
    addressForm: AddAddressRequestDTO,
    _id: string,
    userId: string
  ) {
    if (addressForm.isDefault) {
      await this.addressRepository.updateMany(
        { userId, isDefault: true, _id: { $ne: _id } },
        { $set: { isDefault: false } }
      );
    }

    const updatedAddress = await this.addressRepository.updateById(new Types.ObjectId(_id), {
      ...addressForm,
      userId: new mongoose.Types.ObjectId(addressForm.userId),
    });
    console.log("The updated address", updatedAddress);
    if (!updatedAddress) {
      throw new Error("Address not found or update failed");
    }
    const transformedAddress = {
      ...updatedAddress.toObject(),
      id: updatedAddress._id.toString(),
      userId: updatedAddress.userId.toString(),
    };

    delete transformedAddress._id;
    return transformedAddress;
  }
  async deleteAddress(addressId: string, userId: string) {
    try {
      const user = await this.userRepository.findOne({ _id: userId });

      if (!user) {
        throw new Error("User not found");
      }
      const addressDeleted = await this.addressRepository.deleteById(new Types.ObjectId(addressId));
      if (!addressDeleted) {
        throw new Error("Address not found or could not be deleted");
      }

      return { success: true, message: "Address deleted successfully" };
    } catch (error) {
      console.error("Error in deleting address:", error);
      throw new Error(
        `An error occurred while deleting the address: ${
          (error as Error).message
        }`
      );
    }
  }
}
