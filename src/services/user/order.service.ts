import Razorpay from "razorpay";
import crypto from "crypto";
import { injectable, inject } from "inversify";
import { TYPES } from "../../containers/types";
import { IOrderRepository } from "../../interfaces/repositories/IOrderRepository";
import { IUserOrderService } from "../../interfaces/services/user/IUserOrderService";
import { ICartRepository } from "../../interfaces/repositories/ICartRepository";
import { RazorpayPaymentStatus } from "../../interfaces/checkout.interface";
import mongoose, { Types } from "mongoose";
import {
  RazorpayOrderResponse,
  TimeSlot,
  AvailableDate,
} from "../../interfaces/checkout.interface";
import { ISocketService } from "../../sockets/ISocketService";
import { IAddressRepository } from "../../interfaces/repositories/IAddressRepository";
import { AddressSnapshot } from "../../interfaces/address.interface";
import { INotificationRepository } from "../../interfaces/repositories/INotificationRepository";
import { IServiceRequestRepository } from "../../interfaces/repositories/IServiceRequestRepository";
import redis from "../../config/redisConfig";
import { INearbyProvider } from "../../models/serviceRequest.model";
import { OrderDTO } from "../../dtos/controllers/user/userOrder.controller.dto";
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

  private razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET!,
  });

  async createPaymentOrder(
    amountInRupees: number
  ): Promise<RazorpayOrderResponse> {
    const amountInPaise = amountInRupees * 100;
    const order = await this.razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: true,
    });
    return order;
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    razorpaySignature: string
  ): boolean {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(body.toString())
      .digest("hex");
    console.log("expected signature", expectedSignature);
    return expectedSignature === razorpaySignature;
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
        console.log(
          "the near by provider ids fetched from redis",
          nearbyProviderIds
        );
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
        console.log("the nearby providers", nearbyProviderIds);
        const notifications = nearbyProviderIds.map((providerId) => ({
          recipientId: new Types.ObjectId(providerId),
          recipientType: "provider" as "provider",
          type: "service_request" as "service_request",
          message: "A new service request is available nearby!",
          link: `/provider/orders/${newOrder._id}`,
          isRead: false,
          createdAt: new Date(),
        }));
        console.log("the notifications", notifications);
        const insertManyResult = await this._notificationRepository.insertMany(
          notifications
        );
        console.log("the notification insertMany result", insertManyResult);
        if (!newOrder) {
          console.log("The new order is not getting");
          throw new Error("Order creation failed");
        }
        const deleteResult = await this._cartRepository.deleteById(
          cartObjectId
        );

        if (!deleteResult) {
          console.log("The cart deletion is failed");
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
          console.log("the socket event emitted");
        } else {
          console.log("the socket event emitting failed");
          throw new Error("Unable to emit event: Invalid address coordinates");
        }
        return newOrder;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      console.log("The order saving after payment failed", error);
      throw error;
    }
  }
  async checkPaymentStatus(paymentId: string): Promise<RazorpayPaymentStatus> {
    try {
      const payment = await this.razorpayInstance.payments.fetch(paymentId);
      return payment.status;
    } catch (error) {
      console.error("Error fetching payment status:", error);
      throw new Error("Failed to verify payment status");
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
        orderStatus: "failed" as const, // or however you distinguish it
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
          console.log("The new order is not getting");
          throw new Error("Order creation failed");
        }

        const deleteResult = await this._cartRepository.deleteById(
          cartObjectId
        );

        if (!deleteResult) {
          console.log("The cart deletion is failed");
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
  async getOrderDetails(id: string): Promise<OrderDTO | null> {
    try {
      const order = await this._orderRepository.findOne({ _id: id });
      if (!order) return null;

      const mappedOrder: OrderDTO = {
        _id: order._id.toString(),
        user: {
          _id: order.user._id.toString(),
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone,
        },
        vehicle: {
          _id: order.vehicle._id.toString(),
          brandId: order.vehicle.brandId.toString(),
          modelId: order.vehicle.modelId.toString(),
          brandName: order.vehicle.brandName,
          modelName: order.vehicle.modelName,
          fuel: order.vehicle.fuel,
        },
        services: order.services.map((service: any) => ({
          _id: service._id.toString(),
          title: service.title,
          description: service.description,
          fuelType: service.fuelType,
          servicePackageCategory: service.servicePackageCategory,
          priceBreakup: {
            parts: service.priceBreakup.parts.map((part: any) => ({
              name: part.name,
              price: part.price,
              quantity: part.quantity,
            })),
            laborCharge: service.priceBreakup.laborCharge,
            discount: service.priceBreakup.discount,
            tax: service.priceBreakup.tax,
            total: service.priceBreakup.total,
          },
        })),
        coupon: order.coupon
          ? {
              code: order.coupon.code,
              discountType: order.coupon.discountType,
              discountValue: order.coupon.discountValue,
              discountAmount: order.coupon.discountAmount,
              applied: order.coupon.applied,
            }
          : undefined,
        totalAmount: order.totalAmount,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        razorpaySignature: order.razorpaySignature,
        serviceDate: order.serviceDate?.toString(),
        selectedSlot: order.selectedSlot,
        orderStatus: order.orderStatus,
        statusReason: order.statusReason,
        address: {
          _id: order.address?._id?.toString(),
          addressLine1: order.address.addressLine1,
          addressLine2: order.address.addressLine2,
          city: order.address.city,
          state: order.address.state,
          zipCode: order.address.zipCode,
          location: {
            type: order.address.location.type,
            coordinates: [
              order.address.location.coordinates[0],
              order.address.location.coordinates[1],
            ],
          },
        },
      };

      return mappedOrder;
    } catch (error) {
      throw error;
    }
  }
async getOrderHistory(
  id: string,
  page: number,
  limit: number,
  
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

    const {
      orders,
      pagination,
    } = await this._orderRepository.fetchOrders(userId, limit, page);

    console.log("the order history");

    const sanitizedOrders: OrderDTO[] = orders.map((order) => ({
      ...order.toObject(),
      _id: order._id.toString(),
      user: {
        ...order.user,
        _id: order.user._id.toString(),
      },
      vehicle: {
        ...order.vehicle,
        _id: order.vehicle._id.toString(),
        brandId: order.vehicle.brandId.toString(),
        modelId: order.vehicle.modelId.toString(),
      },
    }));

    return {
      orders: sanitizedOrders,
      pagination,
    };
  } catch (error) {
    console.log(
      "internal server error in the order service function",
      error
    );
    throw error;
  }
}

}
