import { BaseRepository } from "./base/base.repo";
import  { IBrand } from "../models/brand.model";
import { Model } from "mongoose";

export class BrandRepository extends BaseRepository<IBrand> {
  constructor(BrandModel: Model<IBrand>) {
    super(BrandModel);
  }

  async findBrandByName(brandName: string): Promise<IBrand | null> {
    return this.findOne({ brandName });
  }

  async createBrand(brandData: Partial<IBrand>): Promise<IBrand> {
    return this.create(brandData);
  }

  async updateBrand(brandId: string, updateData: Partial<IBrand>): Promise<IBrand | null> {
    return this.updateById(brandId, updateData);
  }

  async deleteBrand(brandId: string): Promise<void> {
    await this.deleteById(brandId);
  }
}
