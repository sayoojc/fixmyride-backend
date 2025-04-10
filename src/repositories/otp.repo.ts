import { IOtp } from "../models/otp.model";
import OtpModel from "../models/otp.model";
import { BaseRepository } from "./base/base.repo";

export class OtpRepository extends BaseRepository<IOtp> {
  constructor() {
    super(OtpModel);
  }

  
  async createOtp(data: Partial<IOtp>): Promise<IOtp> {
    return await this.create(data);
  }

  // Delete OTPs by email
  async deleteByEmail(email: string): Promise<void> {
    await OtpModel.deleteMany({ email });
  }

  // Find the latest OTP by email
  async findLatestOtpByEmail(email: string): Promise<IOtp | null> {
    return await OtpModel.findOne({ email }).sort({ createdAt: -1 }).exec();
  }

  // Delete all expired OTPs
  async deleteExpiredOtps(): Promise<void> {
    await OtpModel.deleteMany({ expiresAt: { $lt: new Date() } });
  }
}
