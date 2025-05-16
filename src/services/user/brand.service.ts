import { BrandRepository } from "../../repositories/brand.repo";
import { IBrand } from "../../models/brand.model";
import { IModel } from "../../models/model.model";
import { ModelRepository } from "../../repositories/model.repo";
import { IUserBrandService } from "../../interfaces/services/user/IUserBrandService";

export class UserBrandService implements IUserBrandService {
  constructor(
    private brandRepository: BrandRepository,
    private modelRepository: ModelRepository
  ) {}
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
    } catch (error) {
      console.error("Error fetching brands with models:", error);
      throw new Error("Fetching brands with models failed");
    }
  }
}
