import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IServiceProvider extends Document {
  _id: Types.ObjectId;
  name: string;
  ownerName: string;
  email: string;
  phone?: string;
  googleId?: string;
  provider?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  location: {
    type: 'Point',
    coordinates: [number, number];
  };
  isListed: boolean;
  verificationStatus?:'pending' | 'approved' | 'rejected';
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  license?: string;
  ownerIdProof?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  startedYear?: number;
  description?: string;
}

const ServiceProviderSchema: Schema = new Schema<IServiceProvider>(
  {
    name: { type: String, required: true },
    ownerName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pinCode: { type: String },
    },
       location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    isListed: { type: Boolean, default: true },
    verificationStatus: {   type: String,enum: ["pending", "approved", "rejected"],},
    password: { type: String },
    license: { type: String },
    ownerIdProof: { type: String },
    profilePicture: { type: String },
    coverPhoto: { type: String },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },
    startedYear: { type: Number },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const ServiceCenter = mongoose.model<IServiceProvider>('ServiceCenter', ServiceProviderSchema);

export default ServiceCenter;
