import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  addressType:string;
  addressLine1: string;
  addressLine2?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    addressType:{type:String,required:true,default:"home"},
    addressLine1: { type: String, required: true },
    addressLine2: { type: String }, // optional
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export default mongoose.model<IAddress>("Address", AddressSchema);


