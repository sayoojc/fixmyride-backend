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


  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }
}
