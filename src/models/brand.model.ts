import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  _id: mongoose.Types.ObjectId;
  brandName: string;
  imageUrl:string;
  status:string;
}

const BrandSchema = new Schema<IBrand>(
  {
    brandName: { type: String, required: true },
    imageUrl: { type: String, required : true },
    status: {type:String,required:true,default:"active"},
  },
  { timestamps: true }
);

export default mongoose.model<IBrand>("Brand", BrandSchema);
