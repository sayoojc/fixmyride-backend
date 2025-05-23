import mongoose, { Model, Document,Types } from "mongoose";
import { IBaseRepository } from "../../interfaces/repositories/IBaseRepository";
type ObjectId = Types.ObjectId

export class BaseRepository<T extends Document> implements IBaseRepository<T>{
  private model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }
 async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return await doc.save();
  }
 async findOne(query: object): Promise<T | null> {
    return await this.model.findOne(query).exec();
  }
 async find(query: object = {}): Promise<T[]> {
    return await this.model.find(query).exec();
  }
  async updateMany(filter: object, update: object): Promise<any> {
    return  this.model.updateMany(filter, update);
  }
 async updateById(id: ObjectId, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
 async deleteById(id: ObjectId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null; 
  }
  async findOneAndUpdate(
    filter: object,
    update: Partial<T>,
    options: object = {}
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, options);
  }
}
