import { BaseRepository } from "./base/base.repo";
import { IVerification } from "../models/verification.model";
import { Model } from "mongoose";

export class VerificationRepository extends BaseRepository<IVerification> {
  constructor(verificationModel: Model<IVerification>) {
    super(verificationModel);
  }

  async findByProviderId(providerId: string): Promise<IVerification | null> {
    return this.findOne({ providerId });
  }

  async upsertVerification(providerId: string, data: Partial<IVerification>): Promise<IVerification | null> {
    return this.findOneAndUpdate(
      { providerId },
      { ...data, submittedAt: new Date(), status: "pending" },
      { new: true, upsert: true }
    );
  }

  async findPendingVerifications(): Promise<IVerification[]> {
    return this.find({ status: "pending" });
  }

  async updateVerificationStatus(providerId: string, status: "approved" | "rejected"): Promise<IVerification | null> {
    return this.findOneAndUpdate(
      { providerId },
      { status },
      { new: true }
    );
  }
}
