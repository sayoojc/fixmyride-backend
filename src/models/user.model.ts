import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: "user" | "admin" | "provider";
  isListed: boolean;
  password?: string;
  profilePicture?: string,
  googleId?:string;
  provider?:"local" | "google";
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String,sparse: true },
    address: { type: String },
    role: { type: String, enum: ["user", "admin", "provider"], default: "user" },
    isListed: { type: Boolean, default: true },
    password: { type: String },
    profilePicture: { type: String, default: "" },
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: ["local", "google"], default: "local" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
