import { BaseRepository } from "./base/base.repo";
import { IModel } from "../models/model.model"; // adjust path as needed
import { Model as MongooseModel } from "mongoose";
import { IModelRepository } from "../interfaces/repositories/IModelRepository";

export class ModelRepository extends BaseRepository<IModel> implements IModelRepository {
  constructor(modelModel: MongooseModel<IModel>) {
    super(modelModel);
  }


}
