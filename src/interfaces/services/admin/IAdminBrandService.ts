import { IBrand } from "../../../models/brand.model";
import { IModel } from "../../../models/model.model";

export interface IAdminBrandService {
  addBrand(brandName: string, imageUrl: string): Promise<IBrand>;
  getAllBrands():Promise<(IBrand & { models: IModel[] })[]>;
  getBrands({
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
  }>;

  toggleBrandStatus(brandId: string, newStatus: string): Promise<IBrand | null>;

  updateBrand(id: string, name: string, imageUrl: string): Promise<IBrand | null>;
}
