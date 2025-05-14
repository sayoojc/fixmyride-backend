import { BaseRepository } from "./base/base.repo";
import  { IBrand } from "../models/brand.model";
import { Model } from "mongoose";

export class BrandRepository extends BaseRepository<IBrand> {
  constructor(BrandModel: Model<IBrand>) {
    super(BrandModel);
  }
}
