import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  modelId: mongoose.Types.ObjectId;
  isDefault:boolean;
  fuel: string;
}


const VehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: "Model", required: true },
    isDefault: {type:Boolean,required:true,default:false},
    fuel: { type: String, required: true },
  },
  { timestamps: true }
);


export default mongoose.model<IVehicle>("Vehicle", VehicleSchema);
