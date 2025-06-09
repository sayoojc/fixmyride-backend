import {TYPES} from '../../containers/types'
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IAdminModelService } from '../../interfaces/services/admin/IAdminModelService';
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

type AddModelResponse = AddModelResponseDTO | { message: string; errors?: any };
type ToggleModelStatusResponse = ToggleModelStatusResponseDTO | { message: string; errors?: any };
type UpdateModelResponse = UpdateModelResponseDTO | { message: string; errors?: any };

@injectable()
export class AdminModelController implements IAdminModelController {
  constructor(
    @inject(TYPES.AdminModelService) private readonly adminModelService: IAdminModelService
  ) {}

  async addModel(
    req: Request<{}, {}, AddModelRequestDTO>,
    res: Response<AddModelResponse>
  ): Promise<void> {
    try {
      const parsed = AddModelRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Invalid input",
          errors: parsed.error.flatten(),
        });
        return;
      }

      let { model, imageUrl, brandId, fuelTypes } = parsed.data;
      model = model[0].toUpperCase() + model.slice(1).toLowerCase();

      const newModel = await this.adminModelService.addModel(
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
        message: `Model ${formattedModel.name} is created`,
        model: formattedModel,
      };

      const validated = AddModelResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO does not match schema");
      }

      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async toggleModelStatus(
    req: Request<{}, {}, ToggleModelStatusRequestDTO>,
    res: Response<ToggleModelStatusResponse>
  ): Promise<void> {
    try {
      const parsed = ToggleModelStatusRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Invalid input",
          errors: parsed.error.flatten(),
        });
        return;
      }

      const { brandId, modelId, newStatus } = parsed.data;
      const updatedModel = await this.adminModelService.toggleModelStatus(
        brandId,
        modelId,
        newStatus
      );

      if (!updatedModel) {
        res.status(404).json({
          success: false,
          message: "Model not found or failed to update status",
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
        message: `Model ${formattedModel.name} status changed to ${formattedModel.status}`,
        model: formattedModel,
      };

      const validated = ToggleModelStatusResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO does not match schema");
      }

      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async updateModel(
    req: Request<{}, {}, UpdateModelRequestDTO>,
    res: Response<UpdateModelResponse>
  ): Promise<void> {
    try {
      const parsed = UpdateModelRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Invalid input",
          errors: parsed.error.flatten(),
        });
        return;
      }

      const { id, name, imageUrl } = parsed.data;
      const updatedModel = await this.adminModelService.updateModel(
        id,
        name,
        imageUrl
      );

      if (!updatedModel) {
        res.status(404).json({ message: "Model not found" });
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
        message: "Model updated successfully",
        model: formattedModel,
      };

      const validated = UpdateModelResponseSchema.safeParse(response);
      if (!validated.success) {
        throw new Error("Response DTO does not match schema");
      }

      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating model:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
