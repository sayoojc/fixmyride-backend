import { TYPES } from "../../containers/types";
import { Types } from "mongoose";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IAdminModelService } from "../../interfaces/services/admin/IAdminModelService";
import { IAdminModelController } from "../../interfaces/controllers/admin/IAdminModelController";
import {
  AddModelRequestDTO,
  AddModelRequestSchema,
  AddModelResponseDTO,
  AddModelResponseSchema,
  ToggleModelStatusRequestDTO,
  ToggleModelStatusRequestSchema,
  ToggleModelStatusResponseDTO,
  ToggleModelStatusResponseSchema,
  UpdateModelRequestDTO,
  UpdateModelRequestSchema,
  UpdateModelResponseDTO,
  UpdateModelResponseSchema,
} from "../../dtos/controllers/admin/AdminModel.controller.dto";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";

type AddModelResponse = AddModelResponseDTO | { message: string; errors?: any };
type ToggleModelStatusResponse =
  | ToggleModelStatusResponseDTO
  | { message: string; errors?: any };
type UpdateModelResponse =
  | UpdateModelResponseDTO
  | { message: string; errors?: any };

@injectable()
export class AdminModelController implements IAdminModelController {
  constructor(
    @inject(TYPES.AdminModelService)
    private readonly _adminModelService: IAdminModelService
  ) {}

  async addModel(
    req: Request<{}, {}, AddModelRequestDTO>,
    res: Response<AddModelResponse>
  ): Promise<void> {
    try {
      const parsed = AddModelRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          message: RESPONSE_MESSAGES.INVALID_INPUT,
          errors: parsed.error.flatten(),
        });
        return;
      }

      let { model, imageUrl, brandId, fuelTypes } = parsed.data;
      model = model[0].toUpperCase() + model.slice(1).toLowerCase();

      const newModel = await this._adminModelService.addModel(
        model,
        imageUrl,
        brandId,
        fuelTypes
      );
      const formattedModel = {
        _id: newModel._id.toString(),
        name: newModel.name,
        imageUrl: newModel.imageUrl,
        status: newModel.status,
        brandId: newModel.brandId.toString(),
        fuelTypes: newModel.fuelTypes,
      };

      const response: AddModelResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_CREATED(
          `Model ${formattedModel.name}`
        ),
        model: formattedModel,
      };

      const validated = AddModelResponseSchema.safeParse(response);
      if (!validated.success) {
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
        .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  async toggleModelStatus(
    req: Request<{id:string}, {}, ToggleModelStatusRequestDTO>,
    res: Response<ToggleModelStatusResponse>
  ): Promise<void> {
    try {
      const parsed = ToggleModelStatusRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          message: RESPONSE_MESSAGES.INVALID_INPUT,
          errors: parsed.error.flatten(),
        });
        return;
      }
      const modelId = req.params.id
      if(!modelId){
          res.status(StatusCode.BAD_REQUEST).json({
          message: RESPONSE_MESSAGES.INVALID_INPUT,
        });
        return;
      }
      const { brandId, newStatus } = parsed.data;
      const updatedModel = await this._adminModelService.toggleModelStatus(
        brandId,
        modelId,
        newStatus
      );
      if (!updatedModel) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.RESOURCE_UPDATE_FAILED("Model"),
        });
        return;
      }
      const formattedModel = {
        _id: updatedModel._id.toString(),
        name: updatedModel.name,
        imageUrl: updatedModel.imageUrl,
        status: updatedModel.status,
        brandId: updatedModel.brandId.toString(),
        fuelTypes: updatedModel.fuelTypes,
      };
      const response: ToggleModelStatusResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED(
          `Model ${formattedModel.name}`
        ),
        model: formattedModel,
      };
      const validated = ToggleModelStatusResponseSchema.safeParse(response);
      if (!validated.success) {
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
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  async updateModel(
    req: Request<{id:string}, {}, UpdateModelRequestDTO>,
    res: Response<UpdateModelResponse>
  ): Promise<void> {
    try {
      const id = req.params.id;
      const newId = new Types.ObjectId(id)
      const parsed = UpdateModelRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(StatusCode.BAD_REQUEST).json({
          message: RESPONSE_MESSAGES.INVALID_INPUT,
          errors: parsed.error.flatten(),
        });
        return;
      }
      const {name, imageUrl,brandId,fuelTypes } = parsed.data;     
      const newBrandId = new Types.ObjectId(brandId);
      const updatedModel = await this._adminModelService.updateModel(
        newId,
        name,
        imageUrl,
        newBrandId,
        fuelTypes
      );
      if (!updatedModel) {
        res
          .status(StatusCode.NOT_FOUND)
          .json({ message: RESPONSE_MESSAGES.RESOURCE_UPDATE_FAILED("Model") });
        return;
      }
      const formattedModel = {
        _id: updatedModel._id.toString(),
        name: updatedModel.name,
        imageUrl: updatedModel.imageUrl,
        status: updatedModel.status,
        brandId: updatedModel.brandId.toString(),
        fuelTypes: updatedModel.fuelTypes,
      };
      const response: UpdateModelResponseDTO = {
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Model"),
        model: formattedModel,
      };

      const validated = UpdateModelResponseSchema.safeParse(response);
      if (!validated.success) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
      }

      res.status(StatusCode.OK).json(response);
    } catch (error) {
      console.error("Error updating model:", error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
}
