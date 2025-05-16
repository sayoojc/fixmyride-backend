import { IVerification } from "../../models/verification.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IVerificationRepository extends IBaseRepository<IVerification> {
  upsertVerification(
    providerId: string,
    data: Partial<IVerification>
  ): Promise<IVerification | null>;

  updateVerificationStatus(
    providerId: string,
    status: "approved" | "rejected"
  ): Promise<IVerification | null>;
}
