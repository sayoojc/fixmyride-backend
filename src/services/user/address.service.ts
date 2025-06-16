import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IAddressRepository } from "../../interfaces/repositories/IAddressRepository";
import mongoose from "mongoose";
import { IUserAddressService } from "../../interfaces/services/user/IUserAddressService";
import { Types } from "mongoose";
import {
  AddAddressRequestDTO,
  AddressResponseDTO,
  AddressDTO
} from "../../dtos/controllers/user/userAddress.controller.dto";

injectable();
export class UserAddressService implements IUserAddressService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.AddressRepository)
    private readonly addressRepository: IAddressRepository
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

    const updatedAddress = await this.addressRepository.updateById(
      new Types.ObjectId(addressId),
      {
        isDefault: true,
      }
    );

    await this.addressRepository.updateMany(
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

    const updatedAddress = await this.addressRepository.updateById(
      new Types.ObjectId(_id),
      {
        ...addressForm,
        userId: new mongoose.Types.ObjectId(addressForm.userId),
      }
    );
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
      const addressDeleted = await this.addressRepository.deleteById(
        new Types.ObjectId(addressId)
      );
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
async getAddresses(userId: string): Promise<AddressDTO[]> {
  try {
    const addresses = await this.addressRepository.find({ userId });

    const addressDtos: AddressDTO[] = addresses.map((addr) => ({
      _id:addr._id.toString(),
      userId: addr.userId.toString(),  // 👈
      addressType: addr.addressType,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      isDefault: addr.isDefault,
    }));

    return addressDtos;
  } catch (error) {
    throw new Error(
      `An error occurred while fetching the addresses: ${
        (error as Error).message
      }`
    );
  }
}

}
