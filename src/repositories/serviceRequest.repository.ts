import { IServiceRequest } from "../models/serviceRequest.model";
import { Model as MongooseModel } from "mongoose";
import { IServiceRequestRepository } from "../interfaces/repositories/IServiceRequestRepository";
import { BaseRepository } from "./base/base.repo";

export class ServiceRequestRepository extends BaseRepository<IServiceRequest> implements IServiceRequestRepository {
    constructor(serviceRequestModel:MongooseModel<IServiceRequest>) {
        super(serviceRequestModel)
    }
}