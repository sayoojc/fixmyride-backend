import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { AppError } from "../../errors/app-error";
import { IUserCartService } from "../../interfaces/services/user/IUserCartService";
import { IUserCartController } from "../../interfaces/controllers/user/IUserCartController";
import {
  AddToCartRequestDTO,
  AddToCartResponseDTO,
  AddServiceToCartResponseSchema,
  AddServiceToCartRequestSchema,
  AddVehicleToCartRequestSchema,
  AddVehicleToCartRequestDTO,
  AddVehicleToCartResponseSchema,
  AddVehicleToCartResponseDTO,
  GetCartResponseDTO,
  GetCartRequestSchema,
  GetCartResponseSchema,
  RemoveFromCartRequestDTO,
  RemoveFromCartRequestSchema,
  RemoveFromCartResponseDTO,
  RemoveFromCartResponseSchema,
  ErrorResponseDTO,
} from "../../dtos/controllers/user/userCart.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

@injectable()
export class UserCartController implements IUserCartController {
  constructor(
    @inject(TYPES.UserCartService)
    private readonly _userCartService: IUserCartService
  ) {}
  async getCart(
    req: Request,
    res: Response<GetCartResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const userId = req.userData?.id;
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const parsed = GetCartRequestSchema.safeParse(
        req.query as { cartId: string }
      );
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const cart = await this._userCartService.getCart(
        userId,
        parsed.data.cartId
      );
      if (!cart) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("Cart"),
        });
        return;
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("cart"),
        cart,
      };
      const validate = GetCartResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
  async addToCart(
    req: Request<{}, {}, AddToCartRequestDTO>,
    res: Response<AddToCartResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      
      const userId = req.userData?.id;
      if (!userId) {
        console.log('no user id');
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const parsed = AddServiceToCartRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      console.log('the data in the add to cart',parsed.data);
      const updatedCart = await this._userCartService.addToCart({
        ...parsed.data,
        userId
      });
      if (!updatedCart) {
        console.log('no updated cart');
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
        return;
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Cart"),
        cart: updatedCart,
      };
      const validate = AddServiceToCartResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log('response validation failed',validate.error.message)
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // fallback for unexpected errors
  res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
  });
    }
  }
  async addVehicleToCart(
    req: Request<{}, {}, AddVehicleToCartRequestDTO>,
    res: Response<AddVehicleToCartResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const userId = req.userData?.id;
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const parsed = AddVehicleToCartRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const updatedCart = await this._userCartService.addVehicleToCart(
        parsed.data.vehicleId,
        userId
      );
      if (!updatedCart) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Cart"),
        cart: updatedCart,
      };
      const validate = AddVehicleToCartResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
  async removeFromCart(
    req: Request<{cartId:string,packageId:string}, {}>,
    res: Response<RemoveFromCartResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const userId = req.userData?.id;
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
const{cartId,packageId} = req.params
      if (!cartId || !packageId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      let cart = await this._userCartService.removeFromCart(
        userId,
        cartId,
        packageId
      );
      let response = {
        success: true,
        message: RESPONSE_MESSAGES.SERVICE_REMOVED_FROM_CART,
        cart,
      };
      const validate = RemoveFromCartResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
}
