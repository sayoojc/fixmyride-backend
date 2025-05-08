
import { ProviderRepository } from "../../repositories/provider.repo";
import { VerificationRepository } from "../../repositories/verification.repo";
import { IServiceProvider } from "../../models/provider.model";
import { IVerification } from "../../models/verification.model";

export class AdminProviderService {
  constructor(
    private providerRepository: ProviderRepository,
    private verificationRepository: VerificationRepository
) {}

  async fetchProviders(): Promise<Partial<IServiceProvider>[] | undefined> {
    try {
      const providers = await this.providerRepository.find();
      const plainProviders = JSON.parse(JSON.stringify(providers));
      const sanitizedProviders = plainProviders.map((provider: Partial<IServiceProvider>) => {
        const { password, ...rest } = provider;
        return rest;
      });
            return sanitizedProviders;
    } catch (error) {
         throw error   
    }
  }
  async fetchVerificationData(id:string):Promise<IVerification | null>{
    try {
        console.log('id from the fetch verification data',id);
        const verificationData = await this.verificationRepository.findByProviderId(id);
        console.log(verificationData);
        return verificationData
    } catch (error) {
        throw error
    }
  }
  async fetchProviderById(id:string): Promise<Partial<IServiceProvider>[] | undefined> {
    try {
      const providers = await this.providerRepository.findOne({_id:id});
      const plainProvider = JSON.parse(JSON.stringify(providers));
    const {password,...sanitizedProvider} = plainProvider
            return sanitizedProvider;
    } catch (error) {
         throw error   
    }
  }
  async verifyProvider(providerId: string, verificationAction: string): Promise<Partial<IServiceProvider> | undefined> {
    try {
      if (verificationAction === "Verified") {
        // Step 1: Fetch verification data
        const verificationData = await this.verificationRepository.findOne({ providerId }) as IVerification;

        if (!verificationData) throw new Error("Verification data not found");
  
        // Step 2: Fetch provider
        const provider = await this.providerRepository.findOne({ _id: providerId });
        if (!provider) throw new Error("Provider not found");
  
        // Step 3: Update provider fields from verification
        provider.license = verificationData.licenseImage;
        provider.ownerIdProof = verificationData.idProofImage;
        provider.verificationStatus = "approved";
        provider.bankDetails = {
          accountHolderName: verificationData.accountHolderName,
          accountNumber: verificationData.accountNumber,
          ifscCode: verificationData.ifscCode,
          bankName: verificationData.bankName
        };
        provider.startedYear = parseInt(verificationData.startedYear);
        provider.description = verificationData.description;
  
        // Step 4: Save provider
        await provider.save();
        await this.verificationRepository.deleteById(verificationData.id.toString());

        // Step 5: Return sanitized data
        const { password, ...sanitized } = provider.toObject();
        return sanitized;
      } else {
        await this.providerRepository.findOneAndUpdate({_id:providerId},{verificationStatus:"rejected"});
      }
    } catch (error) {
      console.error("Error verifying provider:", error);
      throw error;
    }
  }
  

//   async toggleListing(email: string): Promise<SanitizedUser | undefined> {
//     try {
//       const user = await this.userRepository.findOne({ email });
//       if (!user) return undefined;

//       const updatedUser = await this.userRepository.updateById(user._id.toString(), {
//         isListed: !user.isListed,
//       });

//       if (!updatedUser) return undefined;

//       return {
//         name: updatedUser.name,
//         email: updatedUser.email,
//         phone: updatedUser.phone,
//         role: updatedUser.role,
//         isListed: updatedUser.isListed,
//       };
//     } catch (error) {
//       throw new Error("The toggle listing failed");
//     }
//   }
}
