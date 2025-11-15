import { injectable, inject } from "inversify";
import { TYPES } from "../../containers/types";
import { Types } from "mongoose";
import { ICartRepository } from "../../interfaces/repositories/ICartRepository";
import mongoose from "mongoose";
import { IUserCartService } from "../../interfaces/services/user/IUserCartService";
import { AddToCartDataDTO } from "../../dtos/services/user/cart.service.dto";
import { SerializedCart } from "../../interfaces/Cart.interface";
import { ConflictError } from "../../errors/conflict-error";

injectable();
export class UserCartService implements IUserCartService {
  constructor(
    @inject(TYPES.CartRepository)
    private readonly _cartRepository: ICartRepository
  ) {}
  async getCart(
    userId: string,
    cartId: string
  ): Promise<SerializedCart | undefined> {
    try {
      const idCart = new Types.ObjectId(cartId);
      const idUser = new Types.ObjectId(userId);
      const cart = await this._cartRepository.fetchCartPopulated(
        idCart,
        idUser
      );
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
            _id: cart.vehicleId.brandId._id ?cart.vehicleId.brandId._id.toString() : "",
            brandName: cart.vehicleId.brandId.brandName,
            imageUrl: cart.vehicleId.brandId.imageUrl,
            status: cart.vehicleId.brandId.status,
            createdAt: cart.vehicleId.brandId.createdAt,
            updatedAt: cart.vehicleId.brandId.updatedAt,
          },
          modelId: {
            _id: cart.vehicleId.modelId._id ? cart.vehicleId.modelId._id.toString() : "",
            name: cart.vehicleId.modelId.name,
            imageUrl: cart.vehicleId.modelId.imageUrl,
            brandId: cart.vehicleId.modelId.brandId ? cart.vehicleId.modelId.brandId.toString() : "",
            fuelTypes: cart.vehicleId.modelId.fuelTypes,
            createdAt: cart.vehicleId.modelId.createdAt,
            updatedAt: cart.vehicleId.modelId.updatedAt,
          },
        },
        services: Array.isArray(cart.services)
          ? cart.services.map((service) => ({
              serviceId: {
                _id: service._id ? service._id.toString() : "",
                title: service.title,
                description: service.description,
                brandId: service.brandId ? service.brandId.toString() : "",
                modelId: service.modelId ? service.modelId.toString() : "",
                fuelType: service.fuelType,
                servicesIncluded: service.servicesIncluded,
                priceBreakup: {
                  parts: service.priceBreakup.parts,
                  laborCharge: service.priceBreakup.laborCharge,
                  discount: service.priceBreakup.discount,
                  tax: service.priceBreakup.tax,
                  total: service.priceBreakup.total,
                },
                servicePackageCategory: service.servicePackageCategory,
                isBlocked: service.isBlocked,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
              },
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
      throw error;
    }
  }
  async addToCart(data: AddToCartDataDTO): Promise<SerializedCart | undefined> {
    try {
      const serviceObjectId = new mongoose.Types.ObjectId(data.serviceId);
      const isServiceExists = await this._cartRepository.findOne({
        userId: data.userId,
        vehicleId: data.vehicleId,
        services: { $in: [serviceObjectId] },
        isCheckedOut: false,
      });
      if (isServiceExists) {
        throw new ConflictError("Service already exists in cart");
      }
      const cart = await this._cartRepository.upsertCart(data);
      if (!cart) {
        return undefined;}

      const parsedCart = {
        _id: cart._id.toString(),
        userId: cart.userId.toString(),
        vehicleId: {
          _id: cart.vehicleId ? cart.vehicleId._id.toString() : "",
          userId: cart.vehicleId.userId.toString(),
          fuel: cart.vehicleId.fuel,
          isDefault: cart.vehicleId.isDefault,
          createdAt: cart.vehicleId.createdAt,
          updatedAt: cart.vehicleId.updatedAt,
          brandId: {
            _id: cart.vehicleId.brandId._id ? cart.vehicleId.brandId._id.toString() : "",
            brandName: cart.vehicleId.brandId.brandName,
            imageUrl: cart.vehicleId.brandId.imageUrl,
            status: cart.vehicleId.brandId.status,
            createdAt: cart.vehicleId.brandId.createdAt,
            updatedAt: cart.vehicleId.brandId.updatedAt,
          },
          modelId: {
            _id: cart.vehicleId.modelId._id ? cart.vehicleId.modelId._id.toString() : "",
            name: cart.vehicleId.modelId.name,
            imageUrl: cart.vehicleId.modelId.imageUrl,
            brandId: cart.vehicleId.modelId.brandId ? cart.vehicleId.modelId.brandId.toString() : "",
            fuelTypes: cart.vehicleId.modelId.fuelTypes,
            createdAt: cart.vehicleId.modelId.createdAt,
            updatedAt: cart.vehicleId.modelId.updatedAt,
          },
        },
        services: Array.isArray(cart.services)
          ? cart.services.map((service) => ({
              serviceId: {
                _id: service._id ? service._id.toString() : "",
                title: service.title,
                description: service.description,
                brandId:service.brandId ? service.brandId.toString() : "",
                modelId: service.modelId ? service.modelId.toString() : "",
                fuelType: service.fuelType,
                servicesIncluded: service.servicesIncluded,
                priceBreakup: {
                  parts: service.priceBreakup.parts,
                  laborCharge: service.priceBreakup.laborCharge,
                  discount: service.priceBreakup.discount,
                  tax: service.priceBreakup.tax,
                  total: service.priceBreakup.total,
                },
                isBlocked: service.isBlocked,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
              },
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
      const cart = await this._cartRepository.addVehicleToCart(
        idVehicle,
        idUser
      );
      if (!cart) {
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
              serviceId: {
                _id: service._id.toString(),
                title: service.title,
                description: service.description,
                brandId: service.brandId ? service.brandId.toString() : "",
                modelId: service.modelId ? service.modelId.toString() : "",
                fuelType: service.fuelType,
                servicesIncluded: service.servicesIncluded,
                priceBreakup: {
                  parts: service.priceBreakup.parts,
                  laborCharge: service.priceBreakup.laborCharge,
                  discount: service.priceBreakup.discount,
                  tax: service.priceBreakup.tax,
                  total: service.priceBreakup.total,
                },
                isBlocked: service.isBlocked,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
              },
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
      throw error;
    }
  }
  async removeFromCart(
    userId: string,
    cartId: string,
    packageId: string
  ): Promise<SerializedCart> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const cartObjectId = new Types.ObjectId(cartId);
      const packageObjectId = new Types.ObjectId(packageId);
      const cart = await this._cartRepository.removePackageFromCart(
        userObjectId,
        cartObjectId,
        packageObjectId
      );
      if (!cart) {
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
              serviceId: {
                _id: service._id.toString(),
                title: service.title,
                description: service.description,
                brandId: service.brandId.toString(),
                modelId: service.modelId.toString(),
                fuelType: service.fuelType,
                servicesIncluded: service.servicesIncluded,
                priceBreakup: {
                  parts: service.priceBreakup.parts,
                  laborCharge: service.priceBreakup.laborCharge,
                  discount: service.priceBreakup.discount,
                  tax: service.priceBreakup.tax,
                  total: service.priceBreakup.total,
                },
                isBlocked: service.isBlocked,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
              },
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
      throw error;
    }
  }
}
