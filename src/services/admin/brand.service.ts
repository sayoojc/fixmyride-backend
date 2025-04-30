// services/admin/adminBrand.service.ts

import { BrandRepository } from "../../repositories/brand.repo";
import { ModelRepository } from "../../repositories/model.repo";
import { IBrand } from "../../models/brand.model";

export class AdminBrandService {
  constructor(private brandRepository: BrandRepository,private modelRepository: ModelRepository) {}

  async addBrand(brandName: string, imageUrl: string): Promise<IBrand> {
    try {
      const existingBrand = await this.brandRepository.findBrandByName(brandName);
      if (existingBrand) throw new Error("Brand already exists");
      return await this.brandRepository.createBrand({ brandName, imageUrl });
    } catch (err) {
      throw new Error(`Failed to add brand: ${(err as Error).message}`);
    }
  }

  async getBrands(): Promise<IBrand[]> {
    try {
      
      const brands = await this.brandRepository.find();
      console.log('brands', brands);
  
      const brandsWithModels = await Promise.all(
        brands.map(async (brand) => {
          const models = await this.modelRepository.find({ brandId: brand._id });
          return {
            ...brand.toObject(),
            models,
          };
        })
      );
  
      console.log('brands with models:', brandsWithModels);
      return brandsWithModels;
    } catch (err) {
      throw new Error(`Failed to fetch brands: ${(err as Error).message}`);
    }
  }

  async toggleBrandStatus(brandId: string, newStatus: string): Promise<IBrand | null> {
    try {
      return await this.brandRepository.updateById(brandId, { status: newStatus });
    } catch (err) {
      throw new Error(`Failed to toggle brand status: ${(err as Error).message}`);
    }
  }

  async updateBrand(id: string, name: string, imageUrl: string): Promise<IBrand | null> {
    try {
      return await this.brandRepository.updateById(id, { brandName: name, imageUrl });
    } catch (err) {
      throw new Error(`Failed to update brand: ${(err as Error).message}`);
    }
  }
}
