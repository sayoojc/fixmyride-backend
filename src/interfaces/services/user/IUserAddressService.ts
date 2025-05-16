import { IAddress } from "../../../models/adress.model";

export interface IUserAddressService {
  addAddress(addressData: IAddress): Promise<IAddress>;

  setDefaultAddress(addressId: string, userId: string): Promise<void>;

  updateAddress(addressForm: IAddress, _id: string, userId: string): Promise<IAddress>;

  deleteAddress(addressId: string, userId: string): Promise<{ success: boolean; message: string }>;
}
