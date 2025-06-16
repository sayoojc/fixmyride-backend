import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { Types } from "mongoose";
import { IUserOrderService } from "../../interfaces/services/user/IUserOrderService";
import { IUserOrderController } from "../../interfaces/controllers/user/IUserOrderController";

@injectable()
export class UserOrderController implements IUserOrderController {
  constructor(
    @inject(TYPES.UserOrderService)
    private readonly userOrderService: IUserOrderService
  ) {}
  async createRazorpayOrder(req: Request, res: Response): Promise<void> {
    try {
      const { amount } = req.body;
      const order = await this.userOrderService.createPaymentOrder(amount);
      res.status(200).json(order);
    } catch (err) {
      console.error("Razorpay Order Error:", err);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  }
  async verifyRazorpayPayment(req: Request, res: Response): Promise<void> {
    try {
      console.log("req.body", req.body);
      const {
        orderId,
        razorpayPaymentId,
        razorpaySignature,
        cartId,
        selectedAddressId,
        selectedDate,
        selectedSlot,
      } = req.body;

      const isValid = this.userOrderService.verifyPaymentSignature(
        orderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        console.log("its not valid");
        res
          .status(400)
          .json({ success: false, message: "Payment verification failed" });
        return;
      }
      const paymentStatus = await this.userOrderService.checkPaymentStatus(
        razorpayPaymentId
      );

      if (paymentStatus !== "captured") {
        // Payment failed or was not captured
        console.log(`Payment failed with status: ${paymentStatus}`);

        await this.userOrderService.handleFailedPayment(
          orderId,
          razorpayPaymentId,
          paymentStatus,
          cartId,
          selectedAddressId,
          selectedDate,
          selectedSlot,
          razorpaySignature
        );

        res.status(400).json({
          success: false,
          message: `Payment failed with status: ${paymentStatus}`,
          code: "PAYMENT_FAILED",
        });
        return;
      }

      const order = await this.userOrderService.handleSuccessfulPayment(
        orderId,
        razorpayPaymentId,
        razorpaySignature,
        cartId,
        selectedAddressId,
        selectedDate,
        selectedSlot
      );
      console.log("the order from the order controller function ", order);
      res
        .status(200)
        .json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
      console.error("Verification error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error during verification" });
    }
  }
}
