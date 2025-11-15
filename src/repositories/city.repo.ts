import { CityDocument } from "../models/city.model";
import { Model as MongooseModel } from "mongoose";
import { BaseRepository } from "./base/base.repo";
import { ICityRepository } from "../interfaces/repositories/ICityRepository";

export class CityRepository extends BaseRepository<CityDocument> implements ICityRepository {
    constructor(cityModel:MongooseModel<CityDocument>) {
        super(cityModel)
    }

}