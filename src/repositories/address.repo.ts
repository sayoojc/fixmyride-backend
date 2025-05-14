import { BaseRepository } from "./base/base.repo";
import { IAddress } from "../models/adress.model";
import { IAddressRepository } from "../interfaces/repositories/IAddressRepository";
import { Model } from "mongoose";

export class AddressRepository extends BaseRepository<IAddress> implements IAddressRepository  {
  constructor(addressModel: Model<IAddress>) {
    super(addressModel);
  }
}
