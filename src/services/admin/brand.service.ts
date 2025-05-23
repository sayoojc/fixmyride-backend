import { BrandRepository } from "../../repositories/brand.repo";
import { ModelRepository } from "../../repositories/model.repo";
import { IBrand } from "../../models/brand.model";
import { IAdminBrandService } from "../../interfaces/services/admin/IAdminBrandService";
import { IModel } from "../../models/model.model";
import { Types } from "mongoose";

export class AdminBrandService implements IAdminBrandService {
  constructor(
    private brandRepository: BrandRepository,
    private modelRepository: ModelRepository
  ) {}

  async addBrand(brandName: string, imageUrl: string): Promise<IBrand> {
    try {
      const existingBrand = await this.brandRepository.findOne({ brandName });
      if (existingBrand) throw new Error("Brand already exists");
      return await this.brandRepository.create({ brandName, imageUrl });
    } catch (err) {
      throw new Error(`Failed to add brand: ${(err as Error).message}`);
    }
  }

  async getBrands(): Promise<(IBrand & { models: IModel[] })[]> {
    try {
      const brands = await this.brandRepository.find();
      const brandsWithModels = await Promise.all(
        brands.map(async (brand) => {
          const models = await this.modelRepository.find({
            brandId: brand._id,
          });
          return {
            ...brand.toObject(),
            models,
          };
        })
      );
      return brandsWithModels;
    } catch (err) {
      throw new Error(`Failed to fetch brands: ${(err as Error).message}`);
    }
  }

  async toggleBrandStatus(
    brandId: string,
    newStatus: string
  ): Promise<IBrand | null> {
    try {
      return await this.brandRepository.updateById(new Types.ObjectId(brandId), {
        status: newStatus,
      });
    } catch (err) {
      throw new Error(
        `Failed to toggle brand status: ${(err as Error).message}`
      );
    }
  }

  async updateBrand(
    id: string,
    name: string,
    imageUrl: string
  ): Promise<IBrand | null> {
    try {
      return await this.brandRepository.updateById( new Types.ObjectId(id), {
        brandName: name,
        imageUrl,
      });
    } catch (err) {
      throw new Error(`Failed to update brand: ${(err as Error).message}`);
    }
  }
}
