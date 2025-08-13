import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IUserAddressService } from "../../interfaces/services/user/IUserAddressService";
import { TYPES } from "../../containers/types";
import jwt, { JwtPayload } from "jsonwebtoken";
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
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
@injectable()
export class UserAddressController implements IUserAddressController {
  constructor(
    @inject(TYPES.UserAddressService)
    private readonly _userAddressService: IUserAddressService
  ) {}

  async addAddress(
    req: Request<{}, {}, AddAddressRequestDTO>,
    res: Response<AddressResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const parsed = AddressSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }

      const newAddress = await this._userAddressService.addAddress(parsed.data);
      const response: AddressResponseDTO = {
        ...newAddress,
        id: newAddress.id.toString(),
      };
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to add address" });
    }
  }

  async setDefaultAddress(
    req: Request<{id:string}, {}>,
    res: Response<SuccessResponse | ErrorResponse>
  ): Promise<void> {
    try {

      const addressId = req.params.id;
      const userId = req.userData?.id;
          if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      await this._userAddressService.setDefaultAddress(addressId, userId);

      res.status(StatusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.ADDRESS_SET_DEFAULT,
      });
    } catch (error) {
      res
        .status(StatusCode.BAD_REQUEST)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }
  async updateAddress(
    req: Request<{id:string}, {}, UpdateAddressRequestDTO>,
    res: Response<UpdateAddressResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const userId = req.userData?.id;
      if(!userId) {
        res.status(StatusCode.BAD_REQUEST).json({success:false,message:RESPONSE_MESSAGES.UNAUTHORIZED});
        return;
      }
  
              const id = req.params.id;
          if (!userId || id) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const parsed = UpdateAddressRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }     
      const updatedAddress = await this._userAddressService.updateAddress(
       parsed.data.addressForm,
        id,
        userId
      );
      const response: UpdateAddressResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Address"),
        address: updatedAddress,
      };
      const validate = UpdateAddressResponseSchema.safeParse(response);
      if (!validate) {
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
      res
        .status(StatusCode.BAD_REQUEST)
        .json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
  }

  async deleteAddress(
    req: Request<{id:string}, {}>,
    res: Response<SuccessResponse | ErrorResponse>
  ): Promise<void> {
    try {
      const addressId = req.params.id;
       const userId = req.userData?.id;
      if(!userId) {
        res.status(StatusCode.BAD_REQUEST).json({success:false,message:RESPONSE_MESSAGES.UNAUTHORIZED});
        return;
      }
          if (!userId || addressId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const response = await this._userAddressService.deleteAddress(
        addressId,
        userId
      );

      if (response.success) {
        res.status(StatusCode.OK).json({
          success: true,
          message: RESPONSE_MESSAGES.RESOURCE_DELETED("Address"),
        });
      } else {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_NOT_FOUND("Address"),
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async getAddresses(
    req: Request,
    res: Response<GetAddressesResponseDTO | ErrorResponse>
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
      const addresses = await this._userAddressService.getAddresses(userId);
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Addresses"),
        address: addresses,
      };
      const validate = GetAddressesResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.BAD_REQUEST).json({
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
