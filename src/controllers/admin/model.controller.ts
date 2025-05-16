import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AdminModelService } from "../../services/admin/model.service";
import { IAdminModelController } from "../../interfaces/controllers/admin/IAdminModelController";

@injectable()
export class AdminModelController implements IAdminModelController {
  constructor(
    @inject(AdminModelService) private adminModelService: AdminModelService
  ) {}

  async addModel(req: Request, res: Response): Promise<void> {
    try {
      let { model, imageUrl, brandId, fuelTypes } = req.body;
      model = model[0].toUpperCase() + model.slice(1).toLowerCase();

      const newModel = await this.adminModelService.addModel(
        model,
        imageUrl,
        brandId,
        fuelTypes
      );
      res.status(201).json({
        success: true,
        message: `Model ${newModel.name} is created`,
        model: newModel,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async toggleModelStatus(req: Request, res: Response): Promise<void> {
    try {
      const { brandId, modelId, newStatus } = req.body;
      const updatedModel = await this.adminModelService.toggleModelStatus(
        brandId,
        modelId,
        newStatus
      );

      if (!updatedModel) {
        res
          .status(404)
          .json({
            success: false,
            message: "Model not found or failed to update status",
          });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Model ${updatedModel.name} status changed to ${updatedModel.status}`,
        model: updatedModel,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async updateModel(req: Request, res: Response): Promise<void> {
    try {
      const { id, name, imageUrl } = req.body;

      if (!id || !name || !imageUrl) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const updatedModel = await this.adminModelService.updateModel(
        id,
        name,
        imageUrl
      );

      if (!updatedModel) {
        res.status(404).json({ message: "Model not found" });
        return;
      }

      res.status(200).json({
        message: "Model updated successfully",
        model: updatedModel,
      });
    } catch (error) {
      console.error("Error updating model:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
