import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import jwt, { JwtPayload } from "jsonwebtoken";
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

@injectable()
export class UserCartController implements IUserCartController {
  constructor(
    @inject(TYPES.UserCartService)
    private readonly userCartService: IUserCartService
  ) {}
  async getCart(
    req: Request,
    res: Response<GetCartResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        res.status(401).json({
          success: false,
          message: "Not authorized, no access token",
        });
        return;
      }
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;
      if (!user || !user.id) {
        throw new Error("Failed to authenticate");
      }
      const parsed = GetCartRequestSchema.safeParse(req.query as { cartId: string });
      if (!parsed.success) {
        console.log("Request DTO doesnt match",parsed.error.message);
        res.status(400).json({
          success: false,
          message: "Request DTO doesnt match",
        });
        return;
      }
      const cart = await this.userCartService.getCart(
        user.id,
        parsed.data.cartId
      );
      if(!cart){
        console.log('no cart fetched');
            res.status(400).json({
          success: false,
          message: "Cart not found",
        });
        return
      }
      const response = {
        success: true,
        message: "Fetching cart successfull",
        cart,
      };
      const validate = GetCartResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log('the response dto doesnt match',validate.error.message);
        res.status(400).json({
          success: false,
          message: "The response DTO doesnt match",
        });
        return
      }
      res.status(200).json(response);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "The cart fetch failed" });
    }
  }
  async addToCart(
    req: Request<{}, {}, AddToCartRequestDTO>,
    res: Response<AddToCartResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        res.status(401).json({
          success: false,
          message: "Not authorized, no access token",
        });
        return;
      }
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user || !user.id) {
        throw new Error("Failed to authenticate");
      }
      console.log("The request body", req.body);

      const parsed = AddServiceToCartRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log("The request DTO doesnt match", parsed.error.message);
        res.status(400).json({
          success: false,
          message: "The request DTO doesnt match",
        });
        return;
      }
      const updatedCart = await this.userCartService.addToCart({
        ...parsed.data,
        userId: user.id,
      });
      console.log("The updated cart", updatedCart);
      if (!updatedCart) {
        console.log("No updated cart");
        throw new Error("The cart updation failed");
      }
      const response = {
        success: true,
        message: "The card updation successfull",
        cart: updatedCart,
      };
      const validate = AddServiceToCartResponseSchema.safeParse(response);
      if (!validate) {
        console.log("The response DTO doesnt match");
        res.status(400).json({
          success: false,
          message: "The response DTO doesnt match",
        });
      }
      res.status(201).json(response);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "The cart updation failed" });
    }
  }
  async addVehicleToCart(
    req: Request<{}, {}, AddVehicleToCartRequestDTO>,
    res: Response<AddVehicleToCartResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        res.status(401).json({
          success: false,
          message: "Not authorized, no access token",
        });
        return;
      }
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;
      if (!user || !user.id) {
        throw new Error("Failed to authenticate");
      }
      const parsed = AddVehicleToCartRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: "The request DTO doesnt match",
        });
        return;
      }
      const updatedCart = await this.userCartService.addVehicleToCart(
        parsed.data.vehicleId,
        user.id
      );
      if (!updatedCart) {
        throw new Error("The cart updation failed");
      }
      const response = {
        success: true,
        message: "The card updation successfull",
        cart: updatedCart,
      };
      const validate = AddVehicleToCartResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log("The response dto doesnt match", validate.error.message);
        res.status(400).json({
          success: false,
          message: "The response DTO doesnt match",
        });
      }
      res.status(201).json(response);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "The add vehicle to cart failed" });
    }
  }
  async removeFromCart(
    req: Request<{}, {}, RemoveFromCartRequestDTO>,
    res: Response<RemoveFromCartResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        res.status(401).json({
          success: false,
          message: "Not authorized, no access token",
        });
        return;
      }
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;
      if (!user || !user.id) {
        throw new Error("Failed to authenticate");
      }
      const parsed = RemoveFromCartRequestSchema.safeParse(req.body);
      if(!parsed.success){
          res.status(400).json({
          success: false,
          message: "Request DTO doesnt match",
        });
        return;
      }
      let cart = await this.userCartService.removeFromCart(user.id,parsed.data.cartId,parsed.data.packageId)
       let response = {
        success:true,
        message:"Service removed from cart successfully",
        cart
       }
       const validate = RemoveFromCartResponseSchema.safeParse(response);
       if(!validate.success){
          res.status(400).json({
          success: false,
          message: "Response DTO doesnt match",
        });
       }
       res.status(200).json(response);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "The remove from cart failed" });
    }
  }
}
