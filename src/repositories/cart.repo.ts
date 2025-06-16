import { BaseRepository } from "./base/base.repo";
import { Model, Types } from "mongoose";
import { ICartRepository } from "../interfaces/repositories/ICartRepository";
import { ICart } from "../models/cart.model";
import { AddToCartDataDTO } from "../dtos/services/user/cart.service.dto";
import mongoose, { Document } from "mongoose";
import { IPopulatedCart } from "../interfaces/Cart.interface";
import { IServicePackage } from "../interfaces/Cart.interface";

export class CartRepository
  extends BaseRepository<ICart>
  implements ICartRepository
{
  constructor(private readonly cartModel: Model<ICart>) {
    super(cartModel);
  }
  async upsertCart(data: AddToCartDataDTO): Promise<IPopulatedCart> {
    const { userId, serviceId, vehicleId } = data;
   const service = await mongoose.model<IServicePackage>("ServicePackage").findById(serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    const servicePrice = service.priceBreakup.total || 0;
const updatedCart = await this.model.findOneAndUpdate(
  {
    userId,
    isCheckedOut: false,
    services: { $ne: serviceId },
  },
  {
    $push: { services: serviceId },
    $inc: { totalAmount: servicePrice },
  },
  {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }
);

    const populatedCart = await this.model
      .findById(updatedCart._id)
      .populate({
        path: "vehicleId",
        populate: [{ path: "brandId" }, { path: "modelId" }],
      })
      .populate({
        path: "services",
      }).lean<IPopulatedCart>()

    if (!populatedCart) {
      throw new Error("Failed to populate cart after update");
    }

    return populatedCart;
  }
  async addVehicleToCart(
    vehicleId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<IPopulatedCart> {
    const existingCart = await this.model
      .findOne({
        userId,
        vehicleId,
        isCheckedOut: false,
      })
      .populate({
        path: "vehicleId",
        populate: [{ path: "brandId" }, { path: "modelId" }],
      })
      .populate("services")
      .lean<IPopulatedCart>();

    if (existingCart) {
      return existingCart;
    }
    const newCart = new this.model({
      userId,
      vehicleId,
      isCheckedOut: false,
    });
    await newCart.save();
    const populatedCart = await this.model
      .findOne({
        userId,
        vehicleId,
        isCheckedOut: false,
      })
      .populate({
        path: "vehicleId",
        populate: [{ path: "brandId" }, { path: "modelId" }],
      })
      .populate({
        path: "services.serviceId",
      })
      .lean<IPopulatedCart>();

    if (!populatedCart) {
      throw new Error("Failed to populate cart after creation");
    }

    return populatedCart;
  }
  async fetchCartPopulated(
    cartId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<IPopulatedCart> {
    const existingCart = await this.model
      .findOne({
        _id: cartId,
        userId,
        isCheckedOut: false,
      })
      .populate({
        path: "vehicleId",
        populate: [{ path: "brandId" }, { path: "modelId" }],
      })
      .populate("services")
      .lean<IPopulatedCart>();
    if (!existingCart) {
      throw new Error("Cart not found");
    }
    return existingCart;
  }
  async removePackageFromCart(
    userObjectId: mongoose.Types.ObjectId,
    cartObjectId: mongoose.Types.ObjectId,
    servicePackageObjectId: mongoose.Types.ObjectId
  ): Promise<IPopulatedCart> {
    try {
      await this.model.updateOne(
        {
          _id: cartObjectId,
          userId: userObjectId,
        },
        {
          $pull: {
            services: servicePackageObjectId,
          },
        }
      );

      const updatedCart = await this.model
        .findOne({
          _id: cartObjectId,
          userId: userObjectId,
          isCheckedOut: false,
        })
        .populate({
          path: "vehicleId",
          populate: [{ path: "brandId" }, { path: "modelId" }],
        })
        .populate("services")
        .lean<IPopulatedCart>();

      if (!updatedCart) {
        throw new Error("Cart not found after removing service");
      }

      return updatedCart;
    } catch (error) {
      console.error("Error in removePackageFromCart:", error);
      throw new Error("Failed to remove service from cart");
    }
  }
  async findPopulatedCartById(id:Types.ObjectId):Promise<IPopulatedCart>{
    try {
      const cart = await this.model
        .findById(id)
        .populate({
          path: "vehicleId",
          populate: [{ path: "brandId" }, { path: "modelId" }],
        })
        .populate("services")
        .lean<IPopulatedCart>();

      if (!cart) {
        throw new Error("Cart not found after removing service");
      }

      return cart;
    } catch (error) {
         console.error("Error fetching cart:", error);
      throw new Error("Failed to fetch cart by cartid");
    }
  }
}
