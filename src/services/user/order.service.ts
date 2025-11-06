import { injectable, inject } from "inversify";
import { TYPES } from "../../containers/types";
import { IOrderRepository } from "../../interfaces/repositories/IOrderRepository";
import { IUserOrderService } from "../../interfaces/services/user/IUserOrderService";
import { ICartRepository } from "../../interfaces/repositories/ICartRepository";
import mongoose, { Types } from "mongoose";
import { TimeSlot, AvailableDate } from "../../interfaces/checkout.interface";
import { IAddressRepository } from "../../interfaces/repositories/IAddressRepository";
import { AddressSnapshot } from "../../interfaces/address.interface";
import { OrderDTO } from "../../dtos/controllers/user/userOrder.controller.dto";
import { ISocketService } from "../../sockets/ISocketService";
import { INotificationRepository } from "../../interfaces/repositories/INotificationRepository";
import { IServiceRequestRepository } from "../../interfaces/repositories/IServiceRequestRepository";
import redis from "../../config/redisConfig";
import { INearbyProvider } from "../../models/serviceRequest.model";
import { INotification } from "../../models/notification.model";
import { mapOrderToDTO } from "../../utils/orderMapper";
@injectable()
export class UserOrderService implements IUserOrderService {
  constructor(
    @inject(TYPES.OrderRepository)
    private readonly _orderRepository: IOrderRepository,
    @inject(TYPES.CartRepository)
    private readonly _cartRepository: ICartRepository,
    @inject(TYPES.AddressRepository)
    private readonly _addressRepository: IAddressRepository,
    @inject(TYPES.SocketService)
    private readonly _socketService: ISocketService,
    @inject(TYPES.NotificationRepository)
    private readonly _notificationRepository: INotificationRepository,
    @inject(TYPES.ServiceRequestRepository)
    private readonly _serviceRequestRepository: IServiceRequestRepository
  ) {}
  async getOrderDetails(id: string): Promise<OrderDTO | null> {
    try {
      const order = await this._orderRepository.findOne({ _id: id });
      if (!order) return null;
      const mappedOrder = mapOrderToDTO(order);
      return mappedOrder;
    } catch (error) {
      throw error;
    }
  }
  async getOrderHistory(
    id: string,
    page: number,
    limit: number
  ): Promise<{
    orders: OrderDTO[];
    pagination: {
      totalOrders: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      currentPage: number;
    };
  }> {
    try {
      const userId = new mongoose.Types.ObjectId(id);

      const { orders, pagination } = await this._orderRepository.fetchOrders(
        userId,
        limit,
        page
      );
      const sanitizedOrders: OrderDTO[] = orders.map((order) => ({
        ...mapOrderToDTO(order),
      }));

      return {
        orders: sanitizedOrders,
        pagination,
      };
    } catch (error) {
      throw error;
    }
  }
  async placeCashOrder(
    cartId: string,
    paymentMethod: string,
    selectedAddressId:
      | string
      | {
          addressLine1: string;
          addressLine2?: string;
          city: string;
          latitude: number;
          longitude: number;
          state: string;
          zipCode: string;
        },
    selectedDate: AvailableDate,
    selectedSlot: TimeSlot
  ): Promise<string | undefined> {
    try {
      if (paymentMethod !== "cash") {
        console.log("the payment method is not cash");
        throw new Error("Invalid payment method");
      }
      const cartObjectId = new Types.ObjectId(cartId);
      const cart = await this._cartRepository.findPopulatedCartById(
        cartObjectId
      );
      if (!cart) {
        throw new Error("Cart not found");
      }
      const userSnapshot = {
        _id: new Types.ObjectId(cart.userId._id),
        name: cart.userId.name,
        email: cart.userId.email,
        phone: cart.userId.phone,
      };

      const vehicleSnapshot = {
        _id: new Types.ObjectId(cart.vehicleId._id),
        brandId: new Types.ObjectId(cart.vehicleId.brandId._id),
        modelId: new Types.ObjectId(cart.vehicleId.modelId._id),
        fuel: cart.vehicleId.fuel,
        brandName: cart.vehicleId.brandId.brandName,
        modelName: cart.vehicleId.modelId.name,
      };

      const servicesSnapshot = (cart.services ?? []).map((service) => ({
        _id: new Types.ObjectId(service._id),
        title: service.title,
        description: service.description,
        fuelType: service.fuelType,
        servicePackageCategory: service.servicePackageCategory,
        priceBreakup: service.priceBreakup,
      }));

      let addressSnapshot: AddressSnapshot;

      if (typeof selectedAddressId === "string") {
        const addressDoc = await this._addressRepository.findOne({
          _id: new Types.ObjectId(selectedAddressId),
        });

        if (!addressDoc) throw new Error("Address not found");

        addressSnapshot = {
          _id: new Types.ObjectId(addressDoc._id),
          addressLine1: addressDoc.addressLine1,
          addressLine2: addressDoc.addressLine2 ?? "",
          city: addressDoc.city,
          state: addressDoc.state,
          zipCode: addressDoc.zipCode,
          location: addressDoc.location,
        };
      } else {
        addressSnapshot = {
          _id: new Types.ObjectId(),
          addressLine1: selectedAddressId.addressLine1,
          addressLine2: selectedAddressId.addressLine2 || "",
          city: selectedAddressId.city,
          state: selectedAddressId.state,
          zipCode: selectedAddressId.zipCode,
          location: {
            type: "Point",
            coordinates: [
              selectedAddressId.latitude,
              selectedAddressId.longitude,
            ],
          },
        };
      }

      const orderData = {
        user: userSnapshot,
        vehicle: vehicleSnapshot,
        services: servicesSnapshot,
        coupon: cart.coupon,
        totalAmount: cart.totalAmount,
        finalAmount: cart.finalAmount ?? 0,
        paymentMethod: "cash" as const,
        paymentStatus: "pending" as const,
        orderStatus: "placed" as const,
        serviceDate: selectedDate.date.toString(),
        selectedSlot: selectedSlot.time.toString(),
        address: addressSnapshot,
        orderedAt: new Date(),
      };

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const newOrder = await this._orderRepository.create(orderData);
        const nearbyProviderIds = (await redis.georadius(
          "providers:locations",
          addressSnapshot.location.coordinates[0],
          addressSnapshot.location.coordinates[1],
          1000,
          "km"
        )) as string[];
        const pipeline = redis.pipeline();
        console.log("the nearby providers", nearbyProviderIds);
        for (const providerId of nearbyProviderIds) {
          pipeline.get(`provider:socket:${providerId}`);
        }
        const results = await pipeline.exec();
        const nearbyProviders: INearbyProvider[] = [];
        results?.forEach(([err, socketId], index) => {
          const providerId = nearbyProviderIds[index];
          nearbyProviders.push({
            providerId: new Types.ObjectId(providerId),
            socketId: typeof socketId === "string" ? socketId : undefined,
            status: "notified",
          });
        });
        servicesSnapshot.map(async (service) => {
          await this._serviceRequestRepository.create({
            userId: new Types.ObjectId(cart.userId._id),
            orderId: new Types.ObjectId(newOrder._id),
            serviceType: service.servicePackageCategory,
            location: {
              lat: addressSnapshot.location.coordinates[0],
              lng: addressSnapshot.location.coordinates[1],
            },
            status: "pending",
            nearbyProviders: nearbyProviders,
          });
        });
        const notifications: Partial<INotification>[] = nearbyProviderIds.map(
          (providerId) => ({
            recipientId: new Types.ObjectId(providerId),
            recipientType: "provider",
            type: "service_request",
            message: "A new service request is available nearby!",
            link: `/provider/orders/${newOrder._id}`,
            isRead: false,
            createdAt: new Date(),
          })
        );
        const userNotification: Partial<INotification> = {
          recipientId: new Types.ObjectId(cart.userId._id),
          recipientType: "user",
          type: "order",
          message: "Your order has been placed successfully!",
          link: `/user/orders/${newOrder._id}`,
          isRead: false,
        };
        const notification = await this._notificationRepository.create(
          userNotification
        );
        const insertManyResult = await this._notificationRepository.insertMany(
          notifications
        );
        if (!insertManyResult || !notification) {
          throw new Error("Notification creation failed");
        }
        if (!newOrder) {
          throw new Error("Order creation failed");
        }

        const deleteResult = await this._cartRepository.deleteById(
          cartObjectId
        );
        this._socketService.emitToNearbyProviders(
          addressSnapshot.location.coordinates[0],
          addressSnapshot.location.coordinates[1],
           "service:available",
          {
            orderId: newOrder._id,
            vehicleId: newOrder.vehicle._id,
            services: newOrder.services,
            message: "A new service request is available nearby!",
          }
        );

        if (!deleteResult) {
          throw new Error("Cart deletion failed");
        }

        await session.commitTransaction();
        return newOrder._id.toString();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  }
  async handleSuccessfulPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    cartId: string,
    selectedAddressId:
      | string
      | {
          addressLine1: string;
          addressLine2?: string;
          city: string;
          latitude: number;
          longitude: number;
          state: string;
          zipCode: string;
        },
    selectedDate: AvailableDate,
    selectedSlot: TimeSlot
  ) {
    try {
      const cartObjectId = new Types.ObjectId(cartId);

      const cart = await this._cartRepository.findPopulatedCartById(
        cartObjectId
      );
      if (!cart) {
        throw new Error("Cart not found");
      }

      const userSnapshot = {
        _id: new Types.ObjectId(cart.userId._id),
        name: cart.userId.name,
        email: cart.userId.email,
        phone: cart.userId.phone,
      };

      const vehicleSnapshot = {
        _id: new Types.ObjectId(cart.vehicleId._id),
        brandId: new Types.ObjectId(cart.vehicleId.brandId._id),
        brandName: cart.vehicleId.brandId.brandName,
        modelName: cart.vehicleId.modelId.name,
        modelId: new Types.ObjectId(cart.vehicleId.modelId._id),
        year: 0,
        fuel: cart.vehicleId.fuel,
      };
      const servicesSnapshot = (cart.services ?? []).map((service) => ({
        _id: new Types.ObjectId(service._id),
        title: service.title,
        description: service.description,
        fuelType: service.fuelType,
        servicePackageCategory: service.servicePackageCategory,
        priceBreakup: service.priceBreakup,
      }));

      let addressSnapshot: AddressSnapshot;
      if (typeof selectedAddressId === "string") {
        const addressDoc = await this._addressRepository.findOne({
          _id: new Types.ObjectId(selectedAddressId),
        });

        if (!addressDoc) throw new Error("Address not found");

        addressSnapshot = {
          _id: new Types.ObjectId(addressDoc._id),
          addressLine1: addressDoc.addressLine1,
          addressLine2: addressDoc.addressLine2 ?? "",
          city: addressDoc.city,
          state: addressDoc.state,
          zipCode: addressDoc.zipCode,
          location: addressDoc.location,
        };
      } else {
        addressSnapshot = {
          _id: undefined,
          addressLine1: selectedAddressId.addressLine1,
          addressLine2: selectedAddressId.addressLine2 || "",
          city: selectedAddressId.city,
          state: selectedAddressId.state,
          zipCode: selectedAddressId.zipCode,
          location: {
            type: "Point",
            coordinates: [
              selectedAddressId.latitude,
              selectedAddressId.longitude,
            ],
          },
        };
      }
      const orderData = {
        user: userSnapshot,
        vehicle: vehicleSnapshot,
        services: servicesSnapshot,
        coupon: cart.coupon,
        totalAmount: cart.totalAmount,
        finalAmount: cart.finalAmount ?? 0,
        paymentMethod: "online" as const,
        paymentStatus: "paid" as const,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderStatus: "placed" as const,
        serviceDate: selectedDate.date.toString(),
        selectedSlot: selectedSlot.time.toString(),
        address: addressSnapshot,
        orderedAt: new Date(),
      };
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const newOrder = await this._orderRepository.create(orderData);
        const nearbyProviderIds = (await redis.georadius(
          "providers:locations",
          addressSnapshot.location.coordinates[0],
          addressSnapshot.location.coordinates[1],
          20,
          "km"
        )) as string[];
        const pipeline = redis.pipeline();

        for (const providerId of nearbyProviderIds) {
          pipeline.get(`provider:socket:${providerId}`);
        }
        const results = await pipeline.exec();
        const nearbyProviders: INearbyProvider[] = [];
        results?.forEach(([err, socketId], index) => {
          const providerId = nearbyProviderIds[index];
          nearbyProviders.push({
            providerId: new Types.ObjectId(providerId),
            socketId: typeof socketId === "string" ? socketId : undefined,
            status: "notified",
          });
        });
        servicesSnapshot.map(async (service) => {
          await this._serviceRequestRepository.create({
            userId: new Types.ObjectId(cart.userId._id),
            orderId: new Types.ObjectId(newOrder._id),
            serviceType: service.servicePackageCategory,
            location: {
              lat: addressSnapshot.location.coordinates[0],
              lng: addressSnapshot.location.coordinates[1],
            },
            status: "pending",
            nearbyProviders: nearbyProviders,
          });
        });
        const notifications: Partial<INotification>[] = nearbyProviderIds.map(
          (providerId) => ({
            recipientId: new Types.ObjectId(providerId),
            recipientType: "provider",
            type: "service_request",
            message: "A new service request is available nearby!",
            link: `/provider/orders/${newOrder._id}`,
            isRead: false,
            createdAt: new Date(),
          })
        );
        const userNotification: Partial<INotification> = {
          recipientId: new Types.ObjectId(cart.userId._id),
          recipientType: "user",
          type: "order",
          message: "Your order has been placed successfully!",
          link: `/user/orders/${newOrder._id}`,
          isRead: false,
        };
        const notification = await this._notificationRepository.create(
          userNotification
        );
        const insertManyResult = await this._notificationRepository.insertMany(
          notifications
        );
        if (!insertManyResult || !notification) {
          throw new Error("Notification creation failed");
        }
        if (!newOrder) {
          throw new Error("Order creation failed");
        }
        const deleteResult = await this._cartRepository.deleteById(
          cartObjectId
        );
        if (!deleteResult) {
          throw new Error("Cart deletion failed");
        }
        await session.commitTransaction();
        if (
          addressSnapshot &&
          addressSnapshot.location &&
          Array.isArray(addressSnapshot.location.coordinates) &&
          typeof addressSnapshot.location.coordinates[0] === "number" &&
          typeof addressSnapshot.location.coordinates[1] === "number"
        ) {
          this._socketService.emitToNearbyProviders(
            addressSnapshot.location.coordinates[1],
            addressSnapshot.location.coordinates[0],
            "service:available",
            {
              orderId: newOrder._id,
              vehicleId: newOrder.vehicle._id,
              services: newOrder.services,
              message: "A new service request is available nearby!",
            }
          );
          this._socketService.emitOrderUpdate(cart.userId._id, {
            orderId: newOrder._id.toString(),
            status: "placed",
            message: "Your order has been placed successfully!",
          });
        } else {
          throw new Error("Unable to emit event: Invalid address coordinates");
        }
        return newOrder;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error: any) {
      console.error("Error placing order:", error.message);
      throw error;
    }
  }
  async handleFailedPayment(
    razorpayOrderId: string,
    paymentStatus: string,
    cartId: string,
    selectedAddressId:
      | string
      | {
          addressLine1: string;
          addressLine2?: string;
          city: string;
          latitude: number;
          longitude: number;
          state: string;
          zipCode: string;
        },
    selectedDate: AvailableDate,
    selectedSlot: TimeSlot,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<string | undefined> {
    try {
      const cartObjectId = new Types.ObjectId(cartId);
      const cart = await this._cartRepository.findPopulatedCartById(
        cartObjectId
      );

      if (!cart) {
        throw new Error("Cart not found");
      }

      const userSnapshot = {
        _id: cart.userId._id,
        name: cart.userId.name,
        email: cart.userId.email,
        phone: cart.userId.phone,
      };

      const vehicleSnapshot = {
        _id: cart.vehicleId._id,
        brandId: cart.vehicleId.brandId,
        modelId: cart.vehicleId.modelId,
        year: cart.vehicleId.year,
        fuel: cart.vehicleId.fuel,
      };

      const servicesSnapshot = (cart.services ?? []).map((service) => ({
        _id: service._id,
        title: service.title,
        description: service.description,
        fuelType: service.fuelType,
        servicePackageCategory: service.servicePackageCategory,
        priceBreakup: service.priceBreakup,
      }));

      let addressSnapshot: AddressSnapshot;

      if (typeof selectedAddressId === "string") {
        const addressDoc = await this._addressRepository.findOne({
          _id: new Types.ObjectId(selectedAddressId),
        });

        if (!addressDoc) throw new Error("Address not found");

        addressSnapshot = {
          _id: addressDoc._id,
          addressLine1: addressDoc.addressLine1,
          addressLine2: addressDoc.addressLine2 ?? "",
          city: addressDoc.city,
          state: addressDoc.state,
          zipCode: addressDoc.zipCode,
          location: addressDoc.location,
        };
      } else {
        addressSnapshot = {
          _id: new Types.ObjectId(),
          addressLine1: selectedAddressId.addressLine1,
          addressLine2: selectedAddressId.addressLine2 || "",
          city: selectedAddressId.city,
          state: selectedAddressId.state,
          zipCode: selectedAddressId.zipCode,
          location: {
            type: "Point",
            coordinates: [
              selectedAddressId.latitude,
              selectedAddressId.longitude,
            ],
          },
        };
      }

      const orderData = {
        userId: userSnapshot,
        vehicleId: vehicleSnapshot,
        services: servicesSnapshot,
        coupon: cart.coupon,
        totalAmount: cart.totalAmount,
        finalAmount: cart.finalAmount ?? 0,
        paymentMethod: "online" as const,
        paymentStatus,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderStatus: "failed" as const,
        serviceDate: selectedDate.date.toString(),
        selectedSlot: selectedSlot.time.toString(),
        address: addressSnapshot,
        orderedAt: new Date(),
      };

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const newOrder = await this._orderRepository.create(orderData);

        if (!newOrder) {
          throw new Error("Order creation failed");
        }

        const deleteResult = await this._cartRepository.deleteById(
          cartObjectId
        );

        if (!deleteResult) {
          throw new Error("Cart deletion failed");
        }

        await session.commitTransaction();
        return newOrder._id.toString();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      console.error("Error handling failed payment:", error);
    }
  }
}
