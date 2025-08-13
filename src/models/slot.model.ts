import mongoose, { Schema, Document } from "mongoose";

export interface ISlot extends Document {
  _id: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  date: Date;
  timeSlots: {
    startTime: string;
    endTime: string;
    status: string;
    bookedBy?: mongoose.Types.ObjectId;
  }[];
}

const SlotSchema = new Schema<ISlot>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlots: [
      {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        bookedBy: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["active", "inactive","booked"],
          default: "active",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ISlot>("Slot", SlotSchema);
