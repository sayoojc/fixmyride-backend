import { IOrder } from "../../../models/order.model";

export interface IUserEmergencyOrderService {
  handleFailedEmergencyPayment(
    razorpayOrderId: string,
    paymentStatus: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    packageId: string,
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
    userId: string
  ): Promise<string | undefined>;
  handleSuccessfulEmergencyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    packageId: string,
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
    userId: string
  ): Promise<IOrder | undefined>;
  handleEmergencyCashOrder(
  packageId: string,
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
  userId: string
):Promise<IOrder | undefined>
}