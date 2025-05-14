import { BaseRepository } from "./base/base.repo";
import { IModel } from "../models/model.model"; // adjust path as needed
import { Model as MongooseModel } from "mongoose";

export class ModelRepository extends BaseRepository<IModel> {
  constructor(modelModel: MongooseModel<IModel>) {
    super(modelModel);
  }


}
