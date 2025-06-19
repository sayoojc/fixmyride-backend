import { IBaseRepository } from "./IBaseRepository";
import { IBrand } from "../../models/brand.model";

export interface IBrandRepository extends IBaseRepository<IBrand> {
  
    findWithQuery(query: any): Promise<IBrand[]>;
  countDocuments(query: any): Promise<number>;
  findWithPagination(query: any, skip: number, limit: number): Promise<IBrand[]>;
}