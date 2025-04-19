import { BaseRepository } from "./base/base.repo";
import { IModel } from "../models/model.model"; // adjust path as needed
import { Model as MongooseModel } from "mongoose";

export class ModelRepository extends BaseRepository<IModel> {
  constructor(modelModel: MongooseModel<IModel>) {
    super(modelModel);
  }

  async findModelByName(name: string): Promise<IModel | null> {
    return this.findOne({ name });
  }

  async findModelsByBrand(brandId: string): Promise<IModel[]> {
    return this.find({ brand: brandId });
  }

  async createModel(modelData: Partial<IModel>): Promise<IModel> {
    return this.create(modelData);
  }

  async updateModel(modelId: string, updateData: Partial<IModel>): Promise<IModel | null> {
    return this.updateById(modelId, updateData);
  }

  async deleteModel(modelId: string): Promise<void> {
    await this.deleteById(modelId);
  }
}
