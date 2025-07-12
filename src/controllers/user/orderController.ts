import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { Types } from "mongoose";
import { IUserOrderService } from "../../interfaces/services/user/IUserOrderService";
import { IUserOrderController } from "../../interfaces/controllers/user/IUserOrderController";
import {
  CreateRazorpayOrderRequestDTO,
  CreateRazorpayOrderResponseDTO,
  ErrorResponseDTO,
  verifyRazorpayPaymentRequestDTO,
  verifyRazorpayPaymentResponseDTO,
  CreateRazorpayOrderRequestSchema,
  CreateRazorpayOrderResponseSchema,
  verifyRazorpayPaymentRequestSchema,
  verifyRazorpayPaymentResponseSchema,
} from "../../dtos/controllers/user/userOrder.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";

@injectable()
export class UserOrderController implements IUserOrderController {
  constructor(
    @inject(TYPES.UserOrderService)
    private readonly _userOrderService: IUserOrderService
  ) {}
  async createRazorpayOrder(
    req: Request<{}, {}, CreateRazorpayOrderRequestDTO>,
    res: Response<CreateRazorpayOrderResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const parsed = CreateRazorpayOrderRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log('The request dto create razorpay order doesnt match',parsed.error.message)
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: "Request DTO doesnt match" });
        return;
      }
      if (!parsed.data?.amount) {
        throw new Error("no request data is not found");
      }
      const order = await this._userOrderService.createPaymentOrder(
        parsed.data?.amount
      );
      const response = {
        success: true,
        message: "create razor pay order is done",
        order,
      };
      const validate = CreateRazorpayOrderResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log('The response of create razorpayorder doesnt match with the dto',validate.error.message)
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "The response DTO doesnt match",
        });
        return 
      }
      res.status(StatusCode.OK).json(response);
    } catch (err) {
      console.error("Razorpay Order Error:", err);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "create Razorpay order failed" });
    }
  }
  async verifyRazorpayPayment(
    req: Request<{}, {}, verifyRazorpayPaymentRequestDTO>,
    res: Response<verifyRazorpayPaymentResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      console.log('req.body',req.body);
      const parsed = verifyRazorpayPaymentRequestSchema.safeParse(req.body);
      if (!parsed.success) {
                console.log('The request dto verifyRazorpayPayment doesnt match',parsed.error.message)

        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Request DTO doesnt match",
        });
        return;
      }
      const {
        orderId,
        razorpayPaymentId,
        razorpaySignature,
        cartId,
        selectedAddressId,
        selectedDate,
        selectedSlot,
      } = parsed.data;

      const isValid = this._userOrderService.verifyPaymentSignature(
        orderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        console.log("its not valid");
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: "Payment verification failed" });
        return;
      }
      const paymentStatus = await this._userOrderService.checkPaymentStatus(
        razorpayPaymentId
      );

      if (paymentStatus !== "captured") {
        console.log(`Payment failed with status: ${paymentStatus}`);

        await this._userOrderService.handleFailedPayment(
          orderId,
          paymentStatus,
          cartId,
          selectedAddressId,
          selectedDate,
          selectedSlot,
          razorpayPaymentId,
          razorpaySignature
        );

        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: `Payment failed with status: ${paymentStatus}`,
        });
        return;
      }
      const order = await this._userOrderService.handleSuccessfulPayment(
        orderId,
        razorpayPaymentId,
        razorpaySignature,
        cartId,
        selectedAddressId,
        selectedDate,
        selectedSlot
      );
      const response = {
        success: true,
        message: "Payment verification successfull",
      };
      const validate = verifyRazorpayPaymentResponseSchema.safeParse(response);
      if(!validate.success){
        console.log('The response dto doesnt match on verify razorpay order',validate.error.message)
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success:false,
          message:"The response DTO doesnt match"
        })
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Verification error:", error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Server error during verification" });
    }
  }
}
