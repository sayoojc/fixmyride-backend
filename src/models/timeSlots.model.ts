import mongoose, { Schema, Document } from "mongoose";

export interface ITimeSlot extends Document {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
}

const timeSlotSchema = new Schema<ITimeSlot>({
  id: { type: String, required: true, unique: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  displayTime: { type: String, required: true },
});

export const TimeSlot = mongoose.model<ITimeSlot>("TimeSlot", timeSlotSchema);
