import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon {
  code?: string;
  discountType?: "percentage" | "flat";
  discountValue: number;
  discountAmount: number;
  applied: boolean;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  services?: mongoose.Types.ObjectId[];
  coupon?: ICoupon;
  totalAmount?: number;
  finalAmount?: number;
  isCheckedOut?: boolean;
  vehicleId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "ServicePackage",
        required: true,
      },
    ],
    coupon: {
      code: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      discountType: {
        type: String,
        enum: ["percentage", "flat"],
      },
      discountValue: {
        type: Number,
        min: 0,
        default: 0,
      },
      discountAmount: {
        type: Number,
        min: 0,
        default: 0,
      },
      applied: {
        type: Boolean,
        default: false,
      },
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    finalAmount: {
      type: Number,
      min: 0,
    },
    isCheckedOut: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
CartSchema.index({ userId: 1, isCheckedOut: 1 });

// Middleware for updatedAt
CartSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICart>("Cart", CartSchema);
