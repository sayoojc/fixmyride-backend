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
} from "../../dtos/controllers/user/userVehicle.controller.dto";
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
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({
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
        message: "Vehicles fetched successfully",
        vehicles: vehicleArray,
      };
      const validate = GetVehicleResponseSchema.safeParse(response);
      if (!validate.success) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({
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
}
