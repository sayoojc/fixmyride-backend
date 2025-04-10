import mongoose, { Schema, Document } from "mongoose";

// ✅ Define the interface for the refresh token document
export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;   // Reference to the user
  token: string;                      // The refresh token itself
  deviceId: string;                   // Unique device ID
  userAgent: string;                  // Device or browser info
  ipAddress: string;                  // IP address of the client
  createdAt: Date;                    // Creation time
  expiresAt: Date;                    // Expiration time
}

// ✅ Define the schema
const refreshTokenSchema = new Schema<IRefreshToken>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  deviceId: { type: String},
  userAgent: { type: String},
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// ✅ Add TTL index to auto-expire refresh tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshTokenModel = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshTokenModel;
