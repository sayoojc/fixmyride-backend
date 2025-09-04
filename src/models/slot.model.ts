import mongoose, { Schema, Document } from "mongoose";

export type IHourStatus = "available" | "unavailable" | "booked";



export interface ISlot extends Document {
  providerId: mongoose.Types.ObjectId;
  _id: mongoose.Types.ObjectId;
  date: Date;
  dayName: string;
  employees: number;
  hours: { [hour: number]: IHourStatus };
}

const HourStatusSchema = new Schema<IHourStatus>(
  {
    status: {
      type: String,
      enum: ["available", "unavailable", "booked"],
      default: "available",
      required: true,
    },
    bookedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const SlotSchema = new Schema<ISlot>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "ServiceCenter", required: true },
    date: { type: Date, required: true },
    dayName: { type: String, required: true },
    employees: { type: Number, required: true },
    hours: {
      type: Map,
      of: {
        type: String,
        enum: ["available", "unavailable", "booked"],
        default: "available",
      },
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISlot>("Slot", SlotSchema);
