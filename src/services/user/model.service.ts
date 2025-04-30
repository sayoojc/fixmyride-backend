import mongoose from "mongoose";
import { ModelRepository } from "../../repositories/model.repo";
import { IModel } from "../../models/model.model";

export class ModelService {
  constructor(private modelRepository: ModelRepository) {}

  async addModel(model: string, imageUrl: string, brandId: string): Promise<IModel> {
    try {
      const existingModel = await this.modelRepository.findModelByName(model);
      if (existingModel) throw new Error("Model already exists");

      const brandObjectId = new mongoose.Types.ObjectId(brandId);

      return await this.modelRepository.createModel({
        name: model,
        imageUrl,
        brandId: brandObjectId,
      });
    } catch {
      throw new Error("Adding new model failed");
    }
  }

  async updateModel(id: string, name: string, imageUrl: string): Promise<IModel | null> {
    return this.modelRepository.updateById(id, { name, imageUrl });
  }

  async toggleModelStatus(brandId: string, modelId: string, newStatus: string): Promise<IModel | null> {
    try {
      const model = await this.modelRepository.findOne({ _id: modelId });
      if (!model || model.brandId.toString() !== brandId) return null;

      return await this.modelRepository.updateById(modelId, { status: newStatus });
    } catch {
      throw new Error("Toggle model status failed");
    }
  }
}
