import { ProviderRepository } from "../../repositories/provider.repo";
import { VerificationRepository } from "../../repositories/verification.repo";
import { IServiceProvider } from "../../models/provider.model";

type SanitizedProvider = {
  name: string;
  email: string;
  phone?: string;
  isListed:boolean
};

export  interface VerificationFormData {
  licenseImage: string
  idProofImage: string
  accountHolderName: string
  bankName:string
  ifscCode: string
  accountNumber: string
  startedYear: string
  description: string
}

export class ProviderProfileService {
  constructor(private providerRepository: ProviderRepository,
    private verificationRepository:VerificationRepository
  ) {}
async getProfileData(id:string):Promise<SanitizedProvider|undefined>{
        try {
            const user = await this.providerRepository.findOne({_id:id});
          if(!user){
                throw new Error('User details not found')
            }
            const { password, address: rawAddress, ...rest } = user.toObject(); 
            const address = `${rawAddress?.street || ""}, ${rawAddress?.city || ""}, ${rawAddress?.state || ""}, ${rawAddress?.pinCode || ""}`;
            const sanitizedUser = {
              ...rest,
              address,
            };
          return sanitizedUser
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
     const updatedProvider =  await this.providerRepository.updateProviderById(providerId,{verificationStatus:"pending"});
     console.log('updated provider from verify provider',updatedProvider);
    const result = await this.verificationRepository.upsertVerification(providerId, {
      ...data,
      status: "pending",
      submittedAt: new Date(),
    });

    return result;
  }

  async updateProfile(data: Partial<IServiceProvider>): Promise<IServiceProvider | null> {
    if (!data._id) {
      console.log('id is not present in the update profile service function');
      throw new Error("Provider ID is required for updating profile");
    }

    const updatedProvider = await this.providerRepository.updateProviderById(data._id.toString(), data);
    return updatedProvider;
  }
 
}
