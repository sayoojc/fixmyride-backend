import { injectable, inject } from "inversify";
import { TYPES } from "../../containers/types";
import { CartRepository } from "../../repositories/cart.repo";
import { ICartRepository } from "../../interfaces/repositories/ICartRepository";
import mongoose from "mongoose";
import { IUserCartService } from "../../interfaces/services/user/IUserCartService";
import { AddToCartDataDTO } from "../../dtos/services/user/cart.service.dto";
import { ICart } from "../../models/cart.model";
import { CartSchema } from "../../dtos/services/user/cart.service.dto";
import { IService } from "../../models/cart.model";
import { SerializedCart } from "../../interfaces/Cart.interface";

injectable();
export class UserCartService implements IUserCartService {
  constructor(
    @inject(TYPES.CartRepository)
    private readonly cartRepository: ICartRepository
  ) {}
  async addToCart(data: AddToCartDataDTO): Promise<SerializedCart | undefined> {
    try {
      const upsertedCart = await this.cartRepository.upsertCart(data);
      if (!upsertedCart) return undefined;

      const cartObj = upsertedCart.toObject();

      return {
        ...cartObj,
        userId: cartObj.userId.toString(),
        _id: cartObj._id.toString(),
        vehicleId: cartObj.vehicleId.toString(),
        services:
          cartObj.services?.map((service: IService) => ({
            ...service,
            serviceId: service.serviceId.toString(),
          })) ?? [],
      };
    } catch (error) {
      throw error;
    }
  }
  async addVehicleToCart(
    vehicleId: string,
    userId: string
  ): Promise<SerializedCart> {
    try {
      const idVehicle = new mongoose.Types.ObjectId(vehicleId);
      const idUser = new mongoose.Types.ObjectId(userId);
      const cart = await this.cartRepository.addVehicleToCart(
        idVehicle,
        idUser
      );
      console.log("cart", cart);
      if (!cart) {
        console.log("error block");
        throw new Error("cart is not found");
      }
      const parsedCart = {
        _id: cart._id.toString(),
        userId: cart.userId.toString(),
        vehicleId: {
          _id: cart.vehicleId._id.toString(),
          userId: cart.vehicleId.userId.toString(),
          fuel: cart.vehicleId.fuel,
          isDefault: cart.vehicleId.isDefault,
          createdAt: cart.vehicleId.createdAt,
          updatedAt: cart.vehicleId.updatedAt,
          brandId: {
            _id: cart.vehicleId.brandId._id.toString(),
            brandName: cart.vehicleId.brandId.brandName,
            imageUrl: cart.vehicleId.brandId.imageUrl,
            status: cart.vehicleId.brandId.status,
            createdAt: cart.vehicleId.brandId.createdAt,
            updatedAt: cart.vehicleId.brandId.updatedAt,
          },
          modelId: {
            _id: cart.vehicleId.modelId._id.toString(),
            name: cart.vehicleId.modelId.name,
            imageUrl: cart.vehicleId.modelId.imageUrl,
            brandId: cart.vehicleId.modelId.brandId.toString(),
            fuelTypes: cart.vehicleId.modelId.fuelTypes,
            createdAt: cart.vehicleId.modelId.createdAt,
            updatedAt: cart.vehicleId.modelId.updatedAt,
          },
        },
        services: Array.isArray(cart.services)
          ? cart.services.map((service) => ({
              serviceId: service.serviceId?.toString?.() ?? null,
              scheduledDate: service.scheduledDate,
              notes: service.notes,
            }))
          : [],
        coupon: cart.coupon ?? undefined,
        totalAmount: cart.totalAmount,
        finalAmount: cart.finalAmount,
        isCheckedOut: cart.isCheckedOut ?? false,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };
      return parsedCart;
    } catch (error) {
      console.log("The catch blcok of the cart service", error);
      throw error;
    }
  }
}
