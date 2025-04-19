import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  make: string;
  modelName: string;
  year: number;
  registrationNumber: string;
  type?: string; // e.g. "car", "bike"
}

const VehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    make: { type: String, required: true },
    modelName: { type: String, required: true },
    year: { type: Number, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    type: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IVehicle>("Vehicle", VehicleSchema);
