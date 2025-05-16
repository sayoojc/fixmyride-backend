import { ProviderRepository } from "../../repositories/provider.repo";
import { VerificationRepository } from "../../repositories/verification.repo";
import { IServiceProvider } from "../../models/provider.model";
import {
  SanitizedProvider,
  VerificationFormData,
} from "../../interfaces/Provider.interface";
import { IProviderProfileService } from "../../interfaces/services/provider/IProviderProfileService";

export class ProviderProfileService implements IProviderProfileService {
  constructor(
    private providerRepository: ProviderRepository,
    private verificationRepository: VerificationRepository
  ) {}
  async getProfileData(id: string): Promise<SanitizedProvider | undefined> {
    try {
      const user = await this.providerRepository.findOne({ _id: id });
      if (!user) {
        throw new Error("User details not found");
      }
      const { password, address: rawAddress, ...rest } = user.toObject();
      const address = `${rawAddress?.street || ""}, ${
        rawAddress?.city || ""
      }, ${rawAddress?.state || ""}, ${rawAddress?.pinCode || ""}`;
      const sanitizedUser = {
        ...rest,
        address,
      };
      return sanitizedUser;
    } catch (error) {
      console.error("Error fetching users:", error);
      return undefined;
    }
  }

  async verifyProvider(data: VerificationFormData, providerId: string) {
    const requiredFields: (keyof VerificationFormData)[] = [
      "licenseImage",
      "idProofImage",
      "accountHolderName",
      "bankName",
      "ifscCode",
      "accountNumber",
      "startedYear",
      "description",
    ];
    const updatedProvider = await this.providerRepository.updateById(
      providerId,
      { verificationStatus: "pending" }
    );
    const result = await this.verificationRepository.upsertVerification(
      providerId,
      {
        ...data,
        status: "pending",
        submittedAt: new Date(),
      }
    );

    return result;
  }

  async updateProfile(
    data: Partial<IServiceProvider>
  ): Promise<IServiceProvider | null> {
    if (!data._id) {
      throw new Error("Provider ID is required for updating profile");
    }

    const updatedProvider = await this.providerRepository.updateById(
      data._id.toString(),
      data
    );
    return updatedProvider;
  }
}
