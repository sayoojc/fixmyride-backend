import { IAddress } from "../../../models/adress.model";
import {
  AddressSchema,
  AddAddressRequestDTO,
  UpdateAddressRequestDTO,
  SetDefaultAddressRequestDTO,
  DeleteAddressRequestDTO,
  AddressResponseDTO,
  SuccessResponse,
  ErrorResponse,
} from "../../../dtos/controllers/user/userAddress.controller.dto";

export interface IUserAddressService {
  addAddress(addressData: AddAddressRequestDTO): Promise<AddressResponseDTO>;

  setDefaultAddress(addressId: string, userId: string): Promise<void>;

  updateAddress(addressForm: AddAddressRequestDTO, _id: string, userId: string): Promise<IAddress>;

  deleteAddress(addressId: string, userId: string): Promise<{ success: boolean; message: string }>;
}
