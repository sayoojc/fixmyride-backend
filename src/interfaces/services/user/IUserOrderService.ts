import { IOrder } from "../../../models/order.model";
import { RazorpayOrderResponse } from "../../checkout.interface";
import { TimeSlot } from "../../checkout.interface";
import { AvailableDate } from "../../checkout.interface";
import { RazorpayPaymentStatus } from "../../checkout.interface";
import { OrderDTO } from "../../../dtos/controllers/user/userOrder.controller.dto";
export interface IUserOrderService {
  /**
   * Creates a Razorpay order with the given amount in INR.
   * @param amount - Amount in INR (Rupees)
   * @returns A promise that resolves to a RazorpayOrder
   */
  createPaymentOrder(amount: number): Promise<RazorpayOrderResponse>;

  /**
   * Verifies the Razorpay payment signature to ensure authenticity.
   * @param orderId - The Razorpay order ID
   * @param paymentId - The Razorpay payment ID
   * @param razorpaySignature - The signature to verify
   * @returns A boolean indicating if the signature is valid
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    razorpaySignature: string
  ): boolean;

  handleSuccessfulPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    cartId: string,
      selectedAddressId: string | {
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
  ): Promise<IOrder>;
  checkPaymentStatus(paymentId: string): Promise<RazorpayPaymentStatus>;
  handleFailedPayment(
    orderId: string,
    paymentStatus: string,
    cartId: string,
      selectedAddressId: string | {
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
  ): Promise<string | undefined>;
  getOrderDetails(id:string):Promise<OrderDTO | null> 
 getOrderHistory(
  id: string,
  limit: number,
  page: number
): Promise<{
  orders: OrderDTO[];
  pagination: {
    totalOrders: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
  };
}>;
 placeCashOrder(
  cartId: string,
  paymentMethod:string,
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
): Promise<string | undefined>

}
