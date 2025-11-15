import Razorpay from "razorpay";
import crypto from "crypto";
import { injectable, inject } from "inversify";
import { RazorpayPaymentStatus } from "../../interfaces/checkout.interface";
import {
  RazorpayOrderResponse,
} from "../../interfaces/checkout.interface";

import { IUserPaymentService } from "../../interfaces/services/user/IUserPaymentService";

@injectable()
export class UserPaymentService implements IUserPaymentService {
  constructor(
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
    return expectedSignature === razorpaySignature;
  }

  async checkPaymentStatus(paymentId: string): Promise<RazorpayPaymentStatus> {
    try {
      const payment = await this.razorpayInstance.payments.fetch(paymentId);
      return payment.status;
    } catch (error) {
      throw new Error("Failed to verify payment status");
    }
  }

}
