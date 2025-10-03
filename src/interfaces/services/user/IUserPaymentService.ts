import { IOrder } from "../../../models/order.model";
import { RazorpayOrderResponse } from "../../checkout.interface";
import { TimeSlot } from "../../checkout.interface";
import { AvailableDate } from "../../checkout.interface";
import { RazorpayPaymentStatus } from "../../checkout.interface";
export interface IUserPaymentService {
  createPaymentOrder(amount: number): Promise<RazorpayOrderResponse>;
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    razorpaySignature: string
  ): boolean;
  checkPaymentStatus(paymentId: string): Promise<RazorpayPaymentStatus>;

}
