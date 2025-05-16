import { IBrand } from "../../../models/brand.model";
import { IModel } from "../../../models/model.model";

export interface IAdminBrandService {
  addBrand(brandName: string, imageUrl: string): Promise<IBrand>;
  
  getBrands(): Promise<
    Array<
      IBrand & { 
        models: IModel[];
      }
    >
  >;

  toggleBrandStatus(brandId: string, newStatus: string): Promise<IBrand | null>;

  updateBrand(id: string, name: string, imageUrl: string): Promise<IBrand | null>;
}
