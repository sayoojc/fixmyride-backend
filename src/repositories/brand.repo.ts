import { BaseRepository } from "./base/base.repo";
import  { IBrand } from "../models/brand.model";
import { Model } from "mongoose";
import { IBrandRepository } from "../interfaces/repositories/IBrandRepository";

export class BrandRepository extends BaseRepository<IBrand> implements IBrandRepository {
  constructor(BrandModel: Model<IBrand>) {
    super(BrandModel);
  }
}
