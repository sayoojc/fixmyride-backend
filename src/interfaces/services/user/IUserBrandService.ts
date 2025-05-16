import { IBrand } from "../../../models/brand.model";
import { IModel } from "../../../models/model.model";

export interface IUserBrandService {
  getBrands(): Promise<(IBrand & { models: IModel[] })[]>;
}
