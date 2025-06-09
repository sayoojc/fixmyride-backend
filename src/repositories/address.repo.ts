import { BaseRepository } from "./base/base.repo";
import { IAddress } from "../models/address.model";
import { Model } from "mongoose";
import { IAddressRepository } from "../interfaces/repositories/IAddressRepository";

export class AddressRepository extends BaseRepository<IAddress> implements IAddressRepository {
  constructor(addressModel: Model<IAddress>) {
    super(addressModel);
  }
}
