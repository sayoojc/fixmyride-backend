import Razorpay from "razorpay";
import crypto from "crypto"; // for verifying signature
import { injectable, inject } from "inversify";
import { TYPES } from "../../containers/types";
import { IOrderRepository } from "../../interfaces/repositories/IOrderRepository";
import { IUserOrderService } from "../../interfaces/services/user/IUserOrderService";
import { ICartRepository } from "../../interfaces/repositories/ICartRepository";
import { RazorpayPaymentStatus } from "../../interfaces/checkout.interface";
import mongoose, { Types } from "mongoose";

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface AvailableDate {
  date: string;
  available: boolean;
  timeSlots: TimeSlot[];
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number | string;
  amount_paid: number | string;
  amount_due: number | string;
  currency: string;
  receipt?: string | undefined;
  status: string;
  attempts: number;
  created_at: number;
}
@injectable()
export class UserOrderService implements IUserOrderService {
  constructor(
    @inject(TYPES.OrderRepository)
    private readonly orderRepository: IOrderRepository,
    @inject(TYPES.CartRepository)
    private readonly cartRepository: ICartRepository
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
    selectedAddressId: string,
    selectedDate: AvailableDate,
    selectedSlot: TimeSlot
  ) {
    try {
      console.log("selectedDate", selectedDate);
      console.log("selectedSlot", selectedSlot);
      const cartObjectId = new Types.ObjectId(cartId);
      const addressObjectId = new Types.ObjectId(selectedAddressId);
      const cart = await this.cartRepository.findPopulatedCartById(
        cartObjectId
      );
      if (!cart) {
        console.log("no cart found");
        throw new Error("Cart not found");
      }
      console.log("Cart fetched from the order", cart);
      console.log("services before saving:", cart.services);
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

      console.log("Order data being saved:", orderData);
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
    selectedAddressId: string,
    selectedDate: AvailableDate,
    selectedSlot: TimeSlot,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<void> {
    try {
      const cartObjectId = new Types.ObjectId(cartId);
      const addressObjectId = new Types.ObjectId(selectedAddressId);
      const cart = await this.cartRepository.findPopulatedCartById(
        cartObjectId
      );
      if (!cart) {
        console.log("no cart found");
        throw new Error("Cart not found");
      }
      console.log("Cart fetched from the order", cart);
      console.log("services before saving:", cart.services);
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
