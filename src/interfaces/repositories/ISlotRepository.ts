import { ISlot } from "../../models/slot.model";
import { IBaseRepository } from "./IBaseRepository";
import mongoose from "mongoose";
export interface ISlotRepository extends IBaseRepository<ISlot> {
 updateSlotForDay(
  providerId: mongoose.Types.ObjectId,
  date: Date,
  timeSlots: ISlot["timeSlots"]
): Promise<ISlot | null>
}
