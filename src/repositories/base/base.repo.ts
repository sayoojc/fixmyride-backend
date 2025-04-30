import mongoose, { Model, Document } from "mongoose";


export class BaseRepository<T extends Document> {
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

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
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
