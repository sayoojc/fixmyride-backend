import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  _id:Types.ObjectId;
  recipientId: Types.ObjectId;
  recipientType: "user" | "provider";
  type: "service_request" | "order" | "info" | "admin_announcement";
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientType: {
      type: String,
      enum: ["user", "provider"],
      required: true,
    },
    type: {
      type: String,
      enum: ["service_request", "order", "info", "admin_announcement"],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
