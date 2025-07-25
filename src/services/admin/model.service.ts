import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IModelRepository } from "../../interfaces/repositories/IModelRepository";
import { IModel } from "../../models/model.model";
import mongoose from "mongoose";
import { IAdminModelService } from "../../interfaces/services/admin/IAdminModelService";
import { Types } from "mongoose";

injectable();
export class AdminModelService implements IAdminModelService {
  constructor(
    @inject(TYPES.ModelRepository)
    private readonly modelRepository: IModelRepository
  ) {}

  async addModel(
    name: string,
    imageUrl: string,
    brandId: string,
    fuelTypes: string[]
  ): Promise<IModel> {
    const existingModel = await this.modelRepository.findOne({ name });
    if (existingModel) throw new Error("Model already exists");

    const brandObjectId = new mongoose.Types.ObjectId(brandId);

    return this.modelRepository.create({
      name,
      imageUrl,
      brandId: brandObjectId,
      fuelTypes,
    });
  }

  async updateModel(
    id: string,
    name: string,
    imageUrl: string
  ): Promise<IModel | null> {
    return this.modelRepository.updateById(new Types.ObjectId(id), {
      name,
      imageUrl,
    });
  }

  async toggleModelStatus(
    brandId: string,
    modelId: string,
    newStatus: string
  ): Promise<IModel | null> {
    const model = await this.modelRepository.findOne({ _id: modelId });
    if (!model || model.brandId.toString() !== brandId) return null;

    return this.modelRepository.updateById(new Types.ObjectId(modelId), {
      status: newStatus,
    });
  }

  async getModelsByBrand(brandId: string): Promise<IModel[]> {
    return this.modelRepository.find({ brandId });
  }
}
