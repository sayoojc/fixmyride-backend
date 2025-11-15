import mongoose, { Schema, Document } from "mongoose";

export interface CityDocument extends Document {
  name: string;
  district: string;
  lat: number;
  long: number;
}

const citySchema = new Schema<CityDocument>({
  name: { type: String, required: true },
  district: { type: String, required: true },
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
});

export const City = mongoose.model<CityDocument>("City", citySchema);
