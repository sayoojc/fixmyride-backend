import { BaseRepository } from "./base/base.repo";
import { IAddress } from "../models/adress.model";
import { Model } from "mongoose";

export class AddressRepository extends BaseRepository<IAddress> {
  constructor(addressModel: Model<IAddress>) {
    super(addressModel);
  }

  async findAddressesByUserId(userId: string): Promise<IAddress[]> {
    return this.find({ userId });
  }

  async findDefaultAddress(userId: string): Promise<IAddress | null> {
    return this.findOne({ userId, isDefault: true });
  }

  async createAddress(addressData: Partial<IAddress>): Promise<IAddress> {
    return this.create(addressData);
  }

  async updateAddress(addressId: string, updateData: Partial<IAddress>): Promise<IAddress | null> {
    return this.updateById(addressId, updateData);
  }

  async deleteAddress(addressId: string): Promise<void> {
     this.deleteById(addressId);
  }
}
