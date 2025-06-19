import { BaseRepository } from "./base/base.repo";
import  { IBrand } from "../models/brand.model";
import { Model } from "mongoose";
import { IBrandRepository } from "../interfaces/repositories/IBrandRepository";

export class BrandRepository extends BaseRepository<IBrand> implements IBrandRepository {
  private readonly BrandModel:Model<IBrand>
  constructor(BrandModel: Model<IBrand>) {
    super(BrandModel);
    this.BrandModel = BrandModel
  }
    async countDocuments(query: any): Promise<number> {
    return this.BrandModel.countDocuments(query);
  }

  async findWithPagination(query: any, skip: number, limit: number): Promise<IBrand[]> {
    return this.BrandModel.find(query).skip(skip).limit(limit);
  }

  // Optional: override find if not already in BaseRepository
  async findWithQuery(query: any): Promise<IBrand[]> {
    return this.BrandModel.find(query);
  }
}
