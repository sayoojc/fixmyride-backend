import { inject,injectable } from "inversify";
import {TYPES} from '../../containers/types'
import { IProviderRepository } from "../../interfaces/repositories/IProviderRepository";
import { IVerificationRepository } from "../../interfaces/repositories/IVerificationRepository";
import { IServiceProvider } from "../../models/provider.model";
import { UpdateProfileRequestDTO } from "../../dtos/controllers/provider/providerProfile.controller.dto";
import {
  SanitizedProvider,
  VerificationFormData,
} from "../../interfaces/Provider.interface";
import { IProviderProfileService } from "../../interfaces/services/provider/IProviderProfileService";
import mongoose from "mongoose";
@injectable()
export class ProviderProfileService implements IProviderProfileService {
  constructor(
    @inject(TYPES.ProviderRepository) private _providerRepository: IProviderRepository,
   @inject(TYPES.VerificationRepository) private _verificationRepository: IVerificationRepository
  ) {}
  async getProfileData(id: string): Promise<SanitizedProvider | undefined> {
    try {
      const user = await this._providerRepository.findOne({ _id: id });
      if (!user) {
        throw new Error("User details not found");
      }
   const {
      _id,
      name,
      email,
      phone,
      isListed = false,
      address,
      description,
      profileImage,
      verificationStatus,
      location
    } = user.toObject();
          const sanitizedUser: SanitizedProvider = {
      _id: _id.toString(),
      name,
      email,
      phone,
      isListed,
      address: address
        ? `${address.street || ""}, ${address.city || ""}, ${address.state || ""}, ${address.pinCode || ""}`
        : "",
      description,
      profileImage,
      verificationStatus,
      location
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
   await this._providerRepository.updateById(
      new mongoose.Types.ObjectId(providerId),
      { verificationStatus: "pending" }
    );
    const result = await this._verificationRepository.upsertVerification(
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
    data: UpdateProfileRequestDTO
  ): Promise<IServiceProvider | null> {
    if (!data._id) {
      throw new Error("Provider ID is required for updating profile");
    }
    console.log('the data from update profile service function ',data);

    const { _id,addressToSend, ...rest } = data;
  const updatedProvider = await this._providerRepository.updateById(
    new mongoose.Types.ObjectId(_id),
    {...rest,address:addressToSend}
  );
  console.log('the updated provider',updatedProvider);
    return updatedProvider?.toObject();
  }
}

