import { ITimeSlot } from "../models/timeSlots.model";
import { Model as MongooseModel } from "mongoose";
import { ITimeSlotRepository } from "../interfaces/repositories/ITimeSlotsRepository";
import { BaseRepository } from "./base/base.repo";

export class TimeSlotRepository extends BaseRepository<ITimeSlot> implements ITimeSlotRepository {
    constructor(timeSlotModel:MongooseModel<ITimeSlot>) {
        super(timeSlotModel)
    }

}