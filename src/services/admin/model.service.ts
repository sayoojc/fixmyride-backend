// services/admin/adminModel.service.ts

import { ModelRepository } from "../../repositories/model.repo";
import { IModel } from "../../models/model.model";
import mongoose from "mongoose";

export class AdminModelService {
  constructor(private modelRepository: ModelRepository) {}

  async addModel(name: string, imageUrl: string, brandId: string): Promise<IModel> {
    const existingModel = await this.modelRepository.findModelByName(name);
    if (existingModel) throw new Error("Model already exists");

    const brandObjectId = new mongoose.Types.ObjectId(brandId);

    return this.modelRepository.createModel({
      name,
      imageUrl,
      brandId: brandObjectId,
    });
  }

  async updateModel(id: string, name: string, imageUrl: string): Promise<IModel | null> {
    return this.modelRepository.updateById(id, { name, imageUrl });
  }

  async toggleModelStatus(
    brandId: string,
    modelId: string,
    newStatus: string
  ): Promise<IModel | null> {
    const model = await this.modelRepository.findOne({ _id: modelId });
    if (!model || model.brandId.toString() !== brandId) return null;

    return this.modelRepository.updateById(modelId, { status: newStatus });
  }

  async getModelsByBrand(brandId: string): Promise<IModel[]> {
    return this.modelRepository.find({ brandId });
  }
}
