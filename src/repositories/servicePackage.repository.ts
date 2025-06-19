import { BaseRepository } from "./base/base.repo";
import { IServicePackage } from "../models/servicePackage.model";
import { Model } from "mongoose";
import { IServicePackageRepository } from "../interfaces/repositories/IServicePackageRepository";
import { Document } from 'mongoose';
export type ServicePackageDocument = Document & IServicePackage;

export class ServicePackageRepository extends BaseRepository<IServicePackage> implements IServicePackageRepository {
    constructor(private readonly ServicePackageModel:Model<IServicePackage>){
        super(ServicePackageModel)
    }
      async findServicePackagesWithPopulate( query:any,
        skip:number,
        limit:number): Promise<ServicePackageDocument[]> {
    return this.model
      .find(query).skip(skip).limit(limit)
      .populate("brandId")
      .populate("modelId")
      .exec();
  }
     async countDocuments(query: any): Promise<number> {
    return this.ServicePackageModel.countDocuments(query);
  }


}