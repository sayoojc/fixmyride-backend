import { Types } from "mongoose";
import { IModel } from "../../../models/model.model";

export interface IAdminModelService {
  addModel(
    name: string,
    imageUrl: string,
    brandId: string,
    fuelTypes: string[]
  ): Promise<IModel>;

  updateModel(
    id: Types.ObjectId,
    name: string,
    imageUrl: string,
    brandId:Types.ObjectId,
    fuelTypes:string[],
  ): Promise<IModel | null>;

  toggleModelStatus(
    brandId: string,
    modelId: string,
    newStatus: string
  ): Promise<IModel | null>;

  getModelsByBrand(brandId: string): Promise<IModel[]>;
}
