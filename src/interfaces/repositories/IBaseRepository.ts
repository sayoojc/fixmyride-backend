import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findOne(query: object): Promise<T | null>;
  find(query?: object): Promise<T[]>;
  updateMany(filter: object, update: object): Promise<any>;
  updateById(id: ObjectId, data: Partial<T>): Promise<T | null>;
  deleteById(id: ObjectId): Promise<boolean>;
  findOneAndUpdate(
    filter: object,
    update: Partial<T>,
    options?: object
  ): Promise<T | null>;
}
