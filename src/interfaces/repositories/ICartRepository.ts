import { IBaseRepository } from "./IBaseRepository";
import { ICart } from "../../models/cart.model";
import { AddToCartDataDTO } from "../../dtos/repositories/cart.repository.dto";
import { Types } from "mongoose";
import { IPopulatedCart } from "../Cart.interface";
export interface ICartRepository extends IBaseRepository<ICart> {
  upsertCart(data: AddToCartDataDTO): Promise<IPopulatedCart>;
  addVehicleToCart(
    idVehicle: Types.ObjectId,
    idUser: Types.ObjectId
  ): Promise<IPopulatedCart>;
  fetchCartPopulated(
    idVehicle: Types.ObjectId,
    idUser: Types.ObjectId
  ): Promise<IPopulatedCart>;
  removePackageFromCart(
    userObjectId: Types.ObjectId,
    cartObjectId: Types.ObjectId,
    packageObjectId: Types.ObjectId
  ): Promise<IPopulatedCart>;
  findPopulatedCartById(id: Types.ObjectId): Promise<IPopulatedCart>;
}
