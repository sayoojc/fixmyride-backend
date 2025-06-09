import { BaseRepository } from "./base/base.repo";
import { Model } from "mongoose";
import { ICartRepository } from "../interfaces/repositories/ICartRepository";
import { ICart } from "../models/cart.model";
import { AddToCartDataDTO } from "../dtos/services/user/cart.service.dto";
import mongoose,{ Document } from "mongoose";
import { IPopulatedCart } from "../interfaces/Cart.interface";

export class CartRepository
  extends BaseRepository<ICart>
  implements ICartRepository
{
  constructor(private readonly cartModel: Model<ICart>) {
    super(cartModel);
  }
  async upsertCart(data: AddToCartDataDTO): Promise<ICart> {
    const { userId, serviceId, vehicleId } = data;

    const updatedCart = await this.model.findOneAndUpdate(
      {
        userId,
        isCheckedOut: false,
        "services.serviceId": { $ne: serviceId },
      },
      {
        $push: {
          services: {
            serviceId,
          },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return updatedCart!;
  }
async addVehicleToCart(
  vehicleId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
): Promise<IPopulatedCart> {
  const existingCart = await this.model.findOne({
    userId,
    vehicleId,
    isCheckedOut: false,
  }).populate({
    path: "vehicleId",
    populate: [
      { path: "brandId" },
      { path: "modelId" },
    ]
  }).lean<IPopulatedCart>();

  if (existingCart) {
    return existingCart;
  }

  // Step 2: Create new cart
  const newCart = new this.model({
    userId,
    vehicleId,
    isCheckedOut: false,
  });
  await newCart.save();

  // Step 3: Fetch & return the populated version
  const populatedCart = await this.model.findOne({
    userId,
    vehicleId,
    isCheckedOut: false,
  }).populate({
    path: "vehicleId",
    populate: [
      { path: "brandId" },
      { path: "modelId" },
    ]
  }).lean<IPopulatedCart>();

  if (!populatedCart) {
    throw new Error("Failed to populate cart after creation");
  }

  return populatedCart;
}
}

