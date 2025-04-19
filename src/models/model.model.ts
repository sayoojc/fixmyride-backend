import mongoose, { Schema, Document } from "mongoose";

export interface IModel extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  imageUrl: string;
  status:string,
  brandId: mongoose.Types.ObjectId; 
}

const ModelSchema = new Schema<IModel>(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    status: {type:String,required:true,default:"active"},
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IModel>("Model", ModelSchema);

