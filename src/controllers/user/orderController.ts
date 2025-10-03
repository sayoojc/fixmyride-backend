import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
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
  getOrderDetailsResponseSchema,
  GetOrderDetailsResponseDTO,
  GetOrderHistoryResponseDTO,
  getOrderHistoryResponseSchema,
  PlaceCashOrderRequestDTO,
  placeCashOrderRequestSchema,
  placeEmergencyCashOrderRequestSchema,
  placeEmergencyCashOrderRequestDTO
} from "../../dtos/controllers/user/userOrder.controller.dto";
import mongoose from "mongoose";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
import { IUserPaymentService } from "../../interfaces/services/user/IUserPaymentService";
import { IUserEmergencyOrderService } from "../../interfaces/services/user/IUserEmergencyOrderService";

@injectable()
export class UserOrderController implements IUserOrderController {
  constructor(
    @inject(TYPES.UserOrderService)
    private readonly _userOrderService: IUserOrderService,
    @inject(TYPES.UserPaymentService)
    private readonly _userPaymentService:IUserPaymentService,
    @inject(TYPES.UserEmergencyOrderService)
    private readonly _userEmergencyOrderService:IUserEmergencyOrderService
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
      const order = await this._userPaymentService.createPaymentOrder(
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
    } catch (err: any) {
      console.log("the catch block inthe order controller", err.message);
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
      console.log("the verify payment controller called", req.body);
      const userId = req.userData?.id;
      const parsed = verifyRazorpayPaymentRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log(
          "the parsing failed in the controller in the verify payment",
          parsed.error.message
        );
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
        packageId
      } = parsed.data;

      const isValid = this._userPaymentService.verifyPaymentSignature(
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
      const paymentStatus = await this._userPaymentService.checkPaymentStatus(
        razorpayPaymentId
      );

      if (paymentStatus !== "captured") {
        if (cartId) {
          console.log('the payment status is failed and there is cartId and redirecting to handle Failed payment service function ');
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
        } else {
          if(!packageId || !userId){
            res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: RESPONSE_MESSAGES.INVALID_INPUT,
            });
            return;
          }
          console.log('the payment status is failed and there is no cartId and redirecting to handle Failed emergency payment service function ');  
          await this._userEmergencyOrderService.handleFailedEmergencyPayment(
            orderId,
            paymentStatus,
            razorpayPaymentId,
            razorpaySignature,
            packageId,
            selectedAddressId,
            userId
          );
        }
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.PAYMENT_FAILED(paymentStatus),
        });
        return;
      }
      let orderResponse;
      if (cartId) {
        console.log('the payment status is success and there is cartId and redirecting to handle successful payment service function ');
        orderResponse = await this._userOrderService.handleSuccessfulPayment(
          orderId,
          razorpayPaymentId,
          razorpaySignature,
          cartId,
          selectedAddressId,
          selectedDate,
          selectedSlot
        );
      } else {
        if(!packageId || !userId){
          res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: RESPONSE_MESSAGES.INVALID_INPUT,
          });
          return;
        }
        console.log('the payment status is success and there is no cartId and redirecting to handle successful emergency payment service function ');
        orderResponse =
          await this._userEmergencyOrderService.handleSuccessfulEmergencyPayment(
            orderId,
            razorpayPaymentId,
            razorpaySignature,
            packageId,
            selectedAddressId,
            userId
            
          );
      }
      if(!orderResponse){
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.ACTION_SUCCESS,
        orderId: orderResponse._id.toString(),
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
      console.log("the catch block inthe order controller");
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async getOrderDetails(
    req: Request,
    res: Response<GetOrderDetailsResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const orderId = req.params.id;
      console.log("the get order details controller called",orderId);
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        console.log("invalid order id from the get order details");
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const order = await this._userOrderService.getOrderDetails(orderId);
      if (!order) {
        console.log("no order found  from the service file");
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("order"),
        });
        return;
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("order"),
        order,
      };
      const validate = getOrderDetailsResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log("the get order details response validation failed",validate.error.message);
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
  async getOrderHistory(
    req: Request,
    res: Response<GetOrderHistoryResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const id = req.userData?.id;
      const page = req.query.page;
      const limit = req.query.limit;
      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (!pageNum || !limitNum || isNaN(pageNum) || isNaN(limitNum)) {
        res
          .status(400)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      if (!id) {
        console.log("no id");
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.FORBIDDEN });
        return;
      }
      const { orders, pagination } =
        await this._userOrderService.getOrderHistory(id, pageNum, limitNum);
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("order history"),
        orders,
        pagination,
      };
      const validate = getOrderHistoryResponseSchema.safeParse(response);
      if (!validate) {
        console.log("response validation failed");
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.log("the catch block inteh controller");
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async placeCashOrder(
    req: Request<{}, {}, PlaceCashOrderRequestDTO>,
    res: Response
  ): Promise<void> {
    try {
      const parsed = placeCashOrderRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log("the request parsing is failed", parsed.error.message);
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const {
        cartId,
        paymentMethod,
        selectedAddressId,
        selectedDate,
        selectedSlot,
      } = parsed.data;
      const orderId = await this._userOrderService.placeCashOrder(
        cartId,
        paymentMethod,
        selectedAddressId,
        selectedDate,
        selectedSlot
      );
      res.status(StatusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.ACTION_SUCCESS,
        orderId: orderId,
      });
    } catch (error) {
      console.log("the catch block inteh controller");
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
async placeEmergencyCashOrder(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.userData?.id;
    if (!userId) {
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: RESPONSE_MESSAGES.FORBIDDEN,
      });
      return;
    }

    const parsed = placeEmergencyCashOrderRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log("the request parsing failed for emergency cash order", parsed.error.message);
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: RESPONSE_MESSAGES.INVALID_INPUT,
      });
      return;
    }
    const { packageId, selectedAddressId } = parsed.data;
    const orderId = await this._userEmergencyOrderService.handleEmergencyCashOrder(
      packageId,
      selectedAddressId,
      userId
    );

    if (!orderId) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
      return;
    }

    res.status(StatusCode.OK).json({
      success: true,
      message: RESPONSE_MESSAGES.ACTION_SUCCESS,
      orderId: orderId,
    });
  } catch (error) {
    console.log("the catch block in placeEmergencyCashOrder", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}

}
