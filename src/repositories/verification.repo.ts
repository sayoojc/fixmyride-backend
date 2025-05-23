import { BaseRepository } from "./base/base.repo";
import { IVerification } from "../models/verification.model";
import { Model } from "mongoose";
import { IVerificationRepository } from "../interfaces/repositories/IVerificationRepository";

export class VerificationRepository extends BaseRepository<IVerification> implements IVerificationRepository {
  constructor(verificationModel: Model<IVerification>) {
    super(verificationModel);
  }
  async upsertVerification(providerId: string, data: Partial<IVerification>): Promise<IVerification | null> {
    return this.findOneAndUpdate(
      { providerId },
      { ...data, submittedAt: new Date(), status: "pending" },
      { new: true, upsert: true }
    );
  }
  async updateVerificationStatus(providerId: string, status: "approved" | "rejected"): Promise<IVerification | null> {
    return this.findOneAndUpdate(
      { providerId },
      { status },
      { new: true }
    );
  }
}
