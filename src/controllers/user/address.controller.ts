import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IUserAddressService } from "../../interfaces/services/user/IUserAddressService";
import { TYPES } from "../../containers/types";
import jwt,{JwtPayload} from 'jsonwebtoken'
import { IUserAddressController } from "../../interfaces/controllers/user/IUserAddressController";
import {
  AddressSchema,
  AddAddressRequestDTO,
  UpdateAddressRequestDTO,
  SetDefaultAddressRequestDTO,
  DeleteAddressRequestSchema,
  DeleteAddressRequestDTO,
  AddressResponseDTO,
  GetAddressesResponseSchema,
  GetAddressesResponseDTO,
  SuccessResponse,
  ErrorResponse,
  SetDefaultAddressSchema,
  UpdateAddressResponseDTO,
  UpdateAddressResponseSchema,
  UpdateAddressRequestSchema,
} from "../../dtos/controllers/user/userAddress.controller.dto";
@injectable()
export class UserAddressController implements IUserAddressController {
  constructor(
    @inject(TYPES.UserAddressService)
    private readonly userAddressService: IUserAddressService
  ) {}

  async addAddress(
    req: Request<{}, {}, AddAddressRequestDTO>,
    res: Response<AddressResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      console.log('the req.body of add address',req.body);
      const parsed = AddressSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log('The request parsing of the add address failed',parsed.error.message);
        res
          .status(400)
          .json({ success: false, message: "Invalid address data" });
        return;
      }

      const newAddress = await this.userAddressService.addAddress(parsed.data);
      console.log('the new address ',newAddress)
      const response: AddressResponseDTO = {
        ...newAddress,
        id: newAddress.id.toString(),
      };
      console.log('the response fromo the add address',response);
      res.status(201).json(response);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to add address" });
    }
  }

  async setDefaultAddress(
    req: Request<{}, {}, SetDefaultAddressRequestDTO>,
    res: Response<SuccessResponse | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = SetDefaultAddressSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: "Invalid input" });
        return;
      }

      const { addressId, userId } = parsed.data;
      const newAddress = await this.userAddressService.setDefaultAddress(
        addressId,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Address set as default successfully",
      });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async updateAddress(
    req: Request<{}, {}, UpdateAddressRequestDTO>,
    res: Response<UpdateAddressResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = UpdateAddressRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log("The update address no parse");
        res
          .status(400)
          .json({ success: false, message: "Invalid address data" });
        return;
      }
      const { addressForm, _id, userId } = parsed.data;
      const updatedAddress = await this.userAddressService.updateAddress(
        addressForm,
        _id,
        userId
      );
      const response: UpdateAddressResponseDTO = {
        success: true,
        message: "Address updated successfully",
        address: updatedAddress,
      };
      const validate = UpdateAddressResponseSchema.safeParse(response);
      if (!validate) {
        res
          .status(500)
          .json({ success: false, message: "Response validation failed: " });
        return;
      }
      res.status(200).json(response);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async deleteAddress(
    req: Request<{}, {}, DeleteAddressRequestDTO>,
    res: Response<SuccessResponse | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = DeleteAddressRequestSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: "Invalid addressId or userId: " + parsed.error.message,
        });
        return;
      }
      const { addressId, userId } = parsed.data;
      const response = await this.userAddressService.deleteAddress(
        addressId,
        userId
      );

      if (response.success) {
        res.status(200).json({
          success: true,
          message: "Address deleted successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
  async getAddresses(
    req: Request,
    res: Response<GetAddressesResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const accessToken = req.cookies.accessToken;
      if(!accessToken) {
        res.status(401).json({
          success:false,
          message:"Not authorized, no access Token",
        })
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
      const addresses = await this.userAddressService.getAddresses(user.id);
      const response = {
        success:true,
        message:"Address fetched successfully",
        address:addresses
      }
      const validate = GetAddressesResponseSchema.safeParse(response);
      if(!validate.success){
           console.log('the response dto doesnt match',validate.error.message);
        res.status(400).json({
          success: false,
          message: "The response DTO doesnt match",
        });
        return
      }
      res.status(200).json(response);
    } catch (error) {
       res.status(400)
        .json({ success: false, message: "The cart fetch failed" });
    }
  }
}
