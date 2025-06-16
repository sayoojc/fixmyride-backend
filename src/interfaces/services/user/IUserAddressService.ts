import { IAddress } from "../../../models/address.model";
import {
  AddAddressRequestDTO,
  AddressResponseDTO,
  AddressDTO,
} from "../../../dtos/controllers/user/userAddress.controller.dto";

export interface IUserAddressService {
  getAddresses(userId:string):Promise<AddressDTO[]>

  addAddress(addressData: AddAddressRequestDTO): Promise<AddressResponseDTO>;

  setDefaultAddress(addressId: string, userId: string): Promise<void>;

  updateAddress(addressForm: AddAddressRequestDTO, _id: string, userId: string): Promise<IAddress>;

  deleteAddress(addressId: string, userId: string): Promise<{ success: boolean; message: string }>;
}
