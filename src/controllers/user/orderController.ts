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
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

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
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      if (!parsed.data?.amount) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const order = await this._userOrderService.createPaymentOrder(
        parsed.data?.amount
      );
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.ACTION_SUCCESS,
        order,
      };
      const validate = CreateRazorpayOrderResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (err) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async verifyRazorpayPayment(
    req: Request<{}, {}, verifyRazorpayPaymentRequestDTO>,
    res: Response<verifyRazorpayPaymentResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const parsed = verifyRazorpayPaymentRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
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
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      const paymentStatus = await this._userOrderService.checkPaymentStatus(
        razorpayPaymentId
      );

      if (paymentStatus !== "captured") {
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
          message: RESPONSE_MESSAGES.PAYMENT_FAILED(paymentStatus),
        });
        return;
      }
      await this._userOrderService.handleSuccessfulPayment(
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
        message: RESPONSE_MESSAGES.ACTION_SUCCESS,
      };
      const validate = verifyRazorpayPaymentResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
