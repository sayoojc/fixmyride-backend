import mongoose, { Schema, Document } from "mongoose";

export interface ITempUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  otp:string;
  expiresAt:Date;
}

const TempUserSchema = new Schema<ITempUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp:{type:String,required:true},
    expiresAt:{type:Date,default:() => new Date(Date.now() + 30*60*1000),expires:300}
  },
  { timestamps: true }
);

export default mongoose.model<ITempUser>("TempUser", TempUserSchema);
