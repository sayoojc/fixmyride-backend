import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IBrandRepository } from "../../interfaces/repositories/IBrandRepository";
import { IModelRepository } from "../../interfaces/repositories/IModelRepository";
import { IBrand } from "../../models/brand.model";
import { IAdminBrandService } from "../../interfaces/services/admin/IAdminBrandService";
import { IModel } from "../../models/model.model";
import { Types } from "mongoose";

@injectable()
export class AdminBrandService implements IAdminBrandService {
  constructor(
    @inject(TYPES.BrandRepository)
    private readonly _brandRepository: IBrandRepository,
    @inject(TYPES.ModelRepository)
    private readonly _modelRepository: IModelRepository
  ) {}

  async addBrand(brandName: string, imageUrl: string): Promise<IBrand> {
    try {
      const existingBrand = await this._brandRepository.findOne({ brandName });
      if (existingBrand) throw new Error("Brand already exists");
      return await this._brandRepository.create({ brandName, imageUrl });
    } catch (err) {
      throw new Error(`Failed to add brand: ${(err as Error).message}`);
    }
  }
  async getAllBrands():Promise< (IBrand & { models: IModel[] })[]>{
    try {

      const brands = await this._brandRepository.find();
           const brandsWithModels = await Promise.all(
        brands.map(async (brand) => {
          const models = await this._modelRepository.find({
            brandId: brand._id,
          });
          return {
            ...brand.toObject(),
            models,
          };
        })
      );
      return brandsWithModels
    } catch (err) {
            throw new Error(`Failed to fetch brands: ${(err as Error).message}`);

    }
  }
  async getBrands({
    search,
    skip,
    limit,
    statusFilter,
  }: {
    search: string;
    skip: number;
    limit: number;
    statusFilter: string;
  }): Promise<{
    brandsWithModels: (IBrand & { models: IModel[] })[];
    totalCount: number;
  }> {
    try {
      const query: any = {};
      if (search) {
        query.brandName = { $regex: search, $options: "i" };
      }
      if (statusFilter !== "all") {
        query.status = statusFilter;
      }
      const totalCount = await this._brandRepository.countDocuments(query);
      const brands = await this._brandRepository.findWithPagination(
        query,
        skip,
        limit
      );
      const brandsWithModels = await Promise.all(
        brands.map(async (brand) => {
          const models = await this._modelRepository.find({
            brandId: brand._id,
          });
          return {
            ...brand.toObject(),
            models,
          };
        })
      );

      return { brandsWithModels, totalCount };
    } catch (err) {
      throw new Error(`Failed to fetch brands: ${(err as Error).message}`);
    }
  }

  async toggleBrandStatus(
    brandId: string,
    newStatus: string
  ): Promise<IBrand | null> {
    try {
      await this._modelRepository.updateMany({brandId},{status:newStatus});
      return await this._brandRepository.updateById(
        new Types.ObjectId(brandId),
        {
          status: newStatus,
        }
      );
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
      return await this._brandRepository.updateById(new Types.ObjectId(id), {
        brandName: name,
        imageUrl,
      });
    } catch (err) {
      throw new Error(`Failed to update brand: ${(err as Error).message}`);
    }
  }
}
