import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserCartService } from "../../services/user/cart.service";
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
  ErrorResponseDTO,
} from "../../dtos/controllers/user/userCart.controller.dto";

@injectable()
export class UserCartController implements IUserCartController {
  constructor(
    @inject(UserCartService) private userCartService: UserCartService
  ) {}
  // async addToCart(
  //   req: Request<{}, {}, AddToCartRequestDTO>,
  //   res: Response<AddToCartResponseDTO | ErrorResponseDTO>
  // ): Promise<void> {
  //   try {
  //     const accessToken = req.cookies.accessToken;
  //     if (!accessToken) {
  //       res.status(401).json({
  //         success: false,
  //         message: "Not authorized, no access token",
  //       });
  //       return;
  //     }
  //     const userDetails = jwt.verify(
  //       accessToken,
  //       process.env.ACCESS_TOKEN_SECRET!
  //     );
  //     const user = userDetails as JwtPayload;

  //     if (!user || !user.id) {
  //       throw new Error("Failed to authenticate");
  //     }

  //     const parsed = AddServiceToCartRequestSchema.safeParse(req.body);
  //     if (!parsed.success) {
  //       res.status(400).json({
  //         success: false,
  //         message: "The request DTO doesnt match",
  //       });
  //       return;
  //     }
  //     const updatedCart = await this.userCartService.addToCart({
  //       ...parsed.data,
  //       userId: user.id,
  //     });
  //     if (!updatedCart) {
  //       throw new Error("The cart updation failed");
  //     }
  //     const response = {
  //       success: true,
  //       message: "The card updation successfull",
  //       cart: updatedCart,
  //     };
  //     const validate = AddServiceToCartResponseSchema.safeParse(response);
  //     if (!validate) {
  //       res.status(400).json({
  //         success: false,
  //         message: "The response DTO doesnt match",
  //       });
  //     }
  //     res.status(201).json(response);
  //   } catch (error) {
  //     res
  //       .status(400)
  //       .json({ success: false, message: "The cart updation failed" });
  //   }
  // }
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
        user.id,
      );
      console.log('The cart after adding the vehicle',updatedCart);
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
        console.log('The response dto doesnt match',validate.error.message)
        res.status(400).json({
          success: false,
          message: "The response DTO doesnt match",
        });
      }
      res.status(201).json(response);
    } catch (error) {}
  }
}
