import { BaseRepository } from "./base/base.repo";
import { IServicePackage } from "../models/servicePackage.model";
import { Model } from "mongoose";
import { IServicePackageRepository } from "../interfaces/repositories/IServicePackageRepository";
import { Document } from 'mongoose';
export type ServicePackageDocument = Document & IServicePackage;
import { FilterQuery } from "mongoose";

export class ServicePackageRepository extends BaseRepository<IServicePackage> implements IServicePackageRepository {
    constructor(private readonly ServicePackageModel:Model<IServicePackage>){
        super(ServicePackageModel)
    }
      async findServicePackagesWithPopulate( query:FilterQuery<IServicePackage>,
        skip:number,
        limit:number): Promise<ServicePackageDocument[]> {
    return this.model
      .find(query).skip(skip).limit(limit)
      .populate("brandId")
      .populate("modelId")
      .exec();
  }
     async countDocuments(query: FilterQuery<IServicePackage>): Promise<number> {
    return this.ServicePackageModel.countDocuments(query);
  }
  async findServicePackageByIdWithPopulate(id: string): Promise<ServicePackageDocument | null> {
    return this.model
      .findById(id)
      .populate("brandId")
      .populate("modelId")
      .exec();
  } 


}