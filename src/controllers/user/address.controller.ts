import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { UserAddressService } from "../../services/user/address.service";
import { IUserAddressController } from "../../interfaces/controllers/user/IUserAddressController";
import {
  AddressSchema,
  AddAddressRequestDTO,
  UpdateAddressRequestDTO,
  SetDefaultAddressRequestDTO,
  DeleteAddressRequestSchema,
  DeleteAddressRequestDTO,
  AddressResponseDTO,
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
    @inject(UserAddressService) private userAddressService: UserAddressService
  ) {}

  async addAddress(
    req: Request<{}, {}, AddAddressRequestDTO>,
    res: Response<AddressResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = AddressSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ success: false, message: "Invalid address data" });
        return;
      }

      const newAddress = await this.userAddressService.addAddress(parsed.data);
      const response: AddressResponseDTO = {
        ...newAddress,
        _id: newAddress._id.toString(),
      };
      res.status(201).json(response);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to add address" });
    }
  }

  async setDefaultAddress(
    req: Request<{}, {}, SetDefaultAddressRequestDTO>,
    res: Response<{ success: boolean; message: string } | ErrorResponse>
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
        console.log('The update address no parse');
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
}
