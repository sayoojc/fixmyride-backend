import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUserVehicleService } from "../../interfaces/services/user/IUserVehicleService";
import { IUserVehicleController } from "../../interfaces/controllers/user/IUserVehicleController";
import {
  AddVehicleRequestDTO,
  AddVehicleResponseDTO,
  AddVehicleResponseSchema,
  ErrorResponse,
  AddVehicleRequestSchema,
  GetVehicleResponseDTO,
  GetVehicleResponseSchema,
  DeleteVehicleResponseSchema,
  DeleteVehicleResponseDTO,
  EditVehicleRequestDTO,
  EditVehicleRequestSchema,
  EditVehicleResponseDTO,
  EditVehicleResponseSchema,
} from "../../dtos/controllers/user/userVehicle.controller.dto";
import mongoose from "mongoose";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

@injectable()
export class UserVehicleController implements IUserVehicleController {
  constructor(
    @inject(TYPES.UserVehicleService)
    private readonly _userVehicleService: IUserVehicleService
  ) {}

  async addVehicle(
    req: Request<{}, {}, AddVehicleRequestDTO>,
    res: Response<AddVehicleResponseDTO | ErrorResponse>
  ): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res
        .status(StatusCode.UNAUTHORIZED)
        .json({ success: false, message: "Not authorized, no access token" });
      return;
    }
    const parsed = AddVehicleRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: RESPONSE_MESSAGES.INVALID_INPUT,
      });
      return;
    }
    const { brandId, brandName, modelId, modelName, fuelType } = parsed.data;
    try {
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }

      const newVehicle = await this._userVehicleService.addVehicle(
        user.id,
        brandId,
        brandName,
        modelId,
        modelName,
        fuelType
      );
      if (!newVehicle) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_UPDATE_FAILED("Vehicle"),
        });
        return;
      }
      const response = {
        success: true,
        message: "Vehicle added successfully",
        vehicle: newVehicle,
      };
      const validate = AddVehicleResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async getVehicle(
    req: Request,
    res: Response<GetVehicleResponseDTO | ErrorResponse>
  ) {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        res
          .status(StatusCode.UNAUTHORIZED)
          .json({ success: false, message: RESPONSE_MESSAGES.UNAUTHORIZED });
        return;
      }
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user) {
        res
          .status(StatusCode.UNAUTHORIZED)
          .json({ success: false, message: RESPONSE_MESSAGES.UNAUTHORIZED });
        return;
      }
      const vehicleArray = await this._userVehicleService.getVehicle(user.id);
      if (!vehicleArray) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      const response = {
        success: true,
        message: "Vehicles fetched successfully",
        vehicles: vehicleArray,
      };
      const validate = GetVehicleResponseSchema.safeParse(response);
      if (!validate.success) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async deleteVehicle(
    req: Request,
    res: Response<DeleteVehicleResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const vehicleId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const deleted = this._userVehicleService.deleteVehicle(vehicleId);
      if (!deleted) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_DELETED("Vehicle"),
      };
      const validate = DeleteVehicleResponseSchema.safeParse(response);
      if (!validate) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async editVehicle(
    req: Request<{ id: string }, {}, EditVehicleRequestDTO>,
    res: Response<EditVehicleResponseDTO | ErrorResponse>
  ): Promise<void> {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      console.log('the vehicleId',id);
      console.log('the request body0',req.body);
      const { brandId, fuel, modelId, isDefault } = req.body;
    
      const validateRequest = EditVehicleRequestSchema.safeParse(req.body);
      if(!validateRequest.success) {
        console.log('the edit vehicle request validation is failed',validateRequest.error.message)
          res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      const updatedVehicle = await this._userVehicleService.editVehicle(
        id,
        brandId,
        fuel,
        modelId,
        isDefault ?? false
      );
      if (!updatedVehicle) {
        console.log('no update vehicle is found');
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
          return 
      }
      const response = {
        success:true,
        message:RESPONSE_MESSAGES.RESOURCE_UPDATED("Vehicle"),
        vehicle:updatedVehicle
      }
      const validate = EditVehicleResponseSchema.safeParse(response);
      if(!validate.success){
        console.log('the response validation of the edit vehicle is failed',validate.error.message);
           res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
            success: false,
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          });
          return 
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {}
  }
}
