import mongoose, { Document, Schema } from 'mongoose';

export interface IVerification extends Document {
  providerId: mongoose.Types.ObjectId;
  licenseImage: string;
  idProofImage: string;
  accountHolderName: string;
  bankName:string;
  ifscCode: string;
  accountNumber: string;
  startedYear: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

const verificationSchema = new Schema<IVerification>({
  providerId: {
    type: Schema.Types.ObjectId,
    ref: "Provider",
    required: true,
    unique: true, // One verification per provider
  },
  licenseImage: { type: String, required: true },
  idProofImage: { type: String, required: true },
  accountHolderName: { type: String, required: true },
  bankName: {type:String,required:true},
  ifscCode: { type: String, required: true },
  accountNumber: { type: String, required: true },
  startedYear: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export const VerificationModel = mongoose.model<IVerification>("Verification", verificationSchema);
