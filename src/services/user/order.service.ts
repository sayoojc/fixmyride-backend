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

@injectable()
export class UserOrderService implements IUserOrderService {
  constructor(
    @inject(TYPES.OrderRepository)
    private readonly orderRepository: IOrderRepository,
    @inject(TYPES.CartRepository)
    private readonly cartRepository: ICartRepository,
    @inject(TYPES.AddressRepository)
    private readonly addressRepository: IAddressRepository,
    @inject(TYPES.SocketService)
    private readonly socketService: ISocketService

  ) {}

  private razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET!,
  });

  async createPaymentOrder(
    amountInRupees: number
  ): Promise<RazorpayOrderResponse> {
    console.log("the amount got from the service function ", amountInRupees);
    const amountInPaise = amountInRupees * 100;
    console.log("the amount in paisa", amountInPaise);
    const order = await this.razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: true,
    });
    console.log("the order created from the service", order);
    return order;
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    razorpaySignature: string
  ): boolean {
    console.log("the orderId", orderId);
    console.log("the paymentId", paymentId);
    console.log("razorpay signature", razorpaySignature);
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
      selectedAddressId: string | {
    addressLine1: string;
    addressLine2: string;
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
      
      const cart = await this.cartRepository.findPopulatedCartById(
        cartObjectId
      );
            if (!cart) {
        throw new Error("Cart not found");
      }
      let addressObjectId;
      if(typeof selectedAddressId === 'string'){
      addressObjectId = new Types.ObjectId(selectedAddressId);
      } else {
        const newAddress = await this.addressRepository.create({...selectedAddressId,userId:cart.userId});
        addressObjectId = newAddress._id;
      }
   

      const serviceIdArray = cart.services?.map(
        (item) => new Types.ObjectId(item._id)
      );
      const orderData = {
        userId: cart.userId,
        vehicleId: new Types.ObjectId(cart.vehicleId._id),
        services: serviceIdArray,
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
        address: addressObjectId,
        orderedAt: new Date(),
      };
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const newOrder = await this.orderRepository.create(orderData);
        if (!newOrder) {
          console.log("The new order is not getting");
          throw new Error("Order creation failed");
        }
        const deleteResult = await this.cartRepository.deleteById(cartObjectId);

        if (!deleteResult) {
          console.log("The cart deletion is failed");
          throw new Error("Cart deletion failed");
        }
        const address = await this.addressRepository.findOne({_id:addressObjectId});

        await session.commitTransaction();
    if (
  address &&
  address.location &&
  Array.isArray(address.location.coordinates) &&
  typeof address.location.coordinates[0] === 'number' &&
  typeof address.location.coordinates[1] === 'number'
) {
  this.socketService.emitToNearbyProviders(
    address.location.coordinates[0],
    address.location.coordinates[1],
    "service:available",
    {
      orderId: newOrder._id,
      vehicleId: newOrder.vehicleId,
      services: newOrder.services,
      message: "A new service request is available nearby!",
    }
  );
} else {
  console.log("Invalid address coordinates", address);
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
    orderId: string,
    paymentStatus: string,
    cartId: string,
      selectedAddressId: string | {
    addressLine1: string;
    addressLine2: string;
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
  ): Promise<void> {
    try {
   const cartObjectId = new Types.ObjectId(cartId);
      
      const cart = await this.cartRepository.findPopulatedCartById(
        cartObjectId
      );
            if (!cart) {
        throw new Error("Cart not found");
      }
      let addressObjectId;
      if(typeof selectedAddressId === 'string'){
      addressObjectId = new Types.ObjectId(selectedAddressId);
      } else {
        const newAddress = await this.addressRepository.create({...selectedAddressId,userId:cart.userId});
        addressObjectId = newAddress._id;
      }
      const serviceIdArray = cart.services?.map(
        (item) => new Types.ObjectId(item._id)
      );
      const orderData = {
        userId: cart.userId,
        vehicleId: new Types.ObjectId(cart.vehicleId._id),
        services: serviceIdArray,
        coupon: cart.coupon,
        totalAmount: cart.totalAmount,
        finalAmount: cart.finalAmount ?? 0,
        paymentMethod: "online" as const,
        paymentStatus,
        razorpayOrderId: orderId,
        razorpayPaymentId,
        razorpaySignature,
        orderStatus: "placed" as const,
        serviceDate: selectedDate.date.toString(),
        selectedSlot: selectedSlot.time.toString(),
        address: addressObjectId,
        orderedAt: new Date(),
      };
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const newOrder = await this.orderRepository.create(orderData);
        if (!newOrder) {
          console.log("The new order is not getting");
          throw new Error("Order creation failed");
        }
        const deleteResult = await this.cartRepository.deleteById(cartObjectId);

        if (!deleteResult) {
          console.log("The cart deletion is failed");
          throw new Error("Cart deletion failed");
        }
        await session.commitTransaction();
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
