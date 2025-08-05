import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IProviderOrderService } from "../../interfaces/services/provider/IProviderOrderService";
import { IProviderOrderController } from "../../interfaces/controllers/provider/IProviderOrderController";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
import mongoose from "mongoose";
import {
  GetOrderResponseDTO,
  ErrorResponseDTO,
  GetOrderResponseSchema,
} from "../../dtos/controllers/provider/providerOrder.controller.dto";

@injectable()
export class ProviderOrderController implements IProviderOrderController {
  constructor(
    @inject(TYPES.ProviderOrderService)
    private readonly _providerOrderService: IProviderOrderService
  ) {}
  async getOrderData(
    req: Request<{ id: string }>,
    res: Response<GetOrderResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const id = req.params.id;
      console.log("the getOrder data controller function", id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("the order id provided is not valid");
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const order = await this._providerOrderService.getOrderData(id);
      if (!order) {
        console.log("the order fetching from the service layer is failed");
        res
          .status(StatusCode.NOT_FOUND)
          .json({
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
      const validate = GetOrderResponseSchema.safeParse(response);
      if (!validate) {
        console.log("the response validation is failed");
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
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
