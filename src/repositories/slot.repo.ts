import { ISlot } from "../models/slot.model";
import { Model as MongooseModel } from "mongoose";
import { ISlotRepository } from "../interfaces/repositories/ISlotRepository";
import { BaseRepository } from "./base/base.repo";
import mongoose from "mongoose";

export class SlotRepository extends BaseRepository<ISlot> implements ISlotRepository {
    constructor(slotModel:MongooseModel<ISlot>) {
        super(slotModel)
    }

}