import { ProviderRepository } from "../../repositories/provider.repo";
import { formatAddress } from "../../utils/address";
import { VerificationRepository } from "../../repositories/verification.repo";

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
            const address = `${user.address?.street},${user.address?.city},${user.address?.state},${user.address?.pinCode}`
          const sanitizedUser = {
            id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            address:address,
            isListed:user.isListed
          }  
          return sanitizedUser
        } catch (error) {
            console.error("Error fetching users:", error);
            return undefined;
        }
    }
  

  async verifyProvider(data: VerificationFormData, providerId: string) {
    // ✅ Validation
    const requiredFields: (keyof VerificationFormData)[] = [
      "licenseImage",
      "idProofImage",
      "accountHolderName",
      "ifscCode",
      "accountNumber",
      "startedYear",
      "description",
    ];

    // ✅ Upsert (insert if new, update if exists)
    const result = await this.verificationRepository.upsertVerification(providerId, {
      ...data,
      status: "pending",
      submittedAt: new Date(),
    });

    return result;
  }


 
}
