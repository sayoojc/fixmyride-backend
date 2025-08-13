import { ISlot } from "../models/slot.model";
import { Model as MongooseModel } from "mongoose";
import { ISlotRepository } from "../interfaces/repositories/ISlotRepository";
import { BaseRepository } from "./base/base.repo";
import mongoose from "mongoose";

export class SlotRepository extends BaseRepository<ISlot> implements ISlotRepository {
    constructor(slotModel:MongooseModel<ISlot>) {
        super(slotModel)
    }
  async updateSlotForDay(
  providerId: mongoose.Types.ObjectId,
  date: Date,
  timeSlots: ISlot["timeSlots"]
): Promise<ISlot | null> {
  return this.model.findOneAndUpdate(
    { providerId, date },
    {
      $set: { timeSlots },
      $setOnInsert: { providerId, date },
    },
    { upsert: true, new: true }
  ).exec();
}
}