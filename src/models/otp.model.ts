import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string; // or phone
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true }, // Or you can use 'phone' if you're verifying via mobile
    otp: { type: String, required: true }, // This should be hashed before saving
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }, // set manually in controller, e.g., 5 mins from now
  },
  { timestamps: true }
);

// Optional: Delete expired OTPs automatically (mongoose TTL index)
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtp>("Otp", OtpSchema);
