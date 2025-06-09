import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IBrandRepository } from "../../interfaces/repositories/IBrandRepository";
import { IModelRepository } from "../../interfaces/repositories/IModelRepository";
import { IBrand } from "../../models/brand.model";
import { IModel } from "../../models/model.model";
import { IUserBrandService } from "../../interfaces/services/user/IUserBrandService";

@injectable()
export class UserBrandService implements IUserBrandService {
  constructor(
    @inject(TYPES.BrandRepository) private readonly brandRepository: IBrandRepository,
    @inject(TYPES.ModelRepository) private readonly modelRepository: IModelRepository
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
