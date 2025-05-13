
import { ProviderRepository } from "../../repositories/provider.repo";
import { VerificationRepository } from "../../repositories/verification.repo";
import { IServiceProvider } from "../../models/provider.model";
import { IVerification } from "../../models/verification.model";
import { MailService } from "../mail.service";

export class AdminProviderService {
  constructor(
    private providerRepository: ProviderRepository,
    private verificationRepository: VerificationRepository,
    private mailService:MailService
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
  async verifyProvider(providerId: string, verificationAction: string,adminNotes:string): Promise<Partial<IServiceProvider> | undefined> {
    try {
      const provider = await this.providerRepository.findOne({ _id: providerId });
        if (!provider) throw new Error("Provider not found");
      if (verificationAction === "Verified") {
        const verificationData = await this.verificationRepository.findOne({ providerId }) as IVerification;

        if (!verificationData) throw new Error("Verification data not found");
  
        // Step 2: Fetch provider
        
  
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
             const subject = "Your Provider Account is Verified!";
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4CAF50;">Welcome to Our Platform, ${provider.name}!</h2>
          <p>We're thrilled to let you know that your service provider account has been <strong>successfully verified</strong>.</p>
          <p>You can now start offering your services on our platform and connect with thousands of customers.</p>
          <p style="margin-top: 20px;">If you have any questions, feel free to reach out to our support team.</p>
          <br />
          <p>Warm regards,<br/><strong>The Admin Team</strong></p>
        </div>
      `;
      await this.mailService.sendWelcomeEmail(provider.email, subject, html);

        // Step 5: Return sanitized data
        const { password, ...sanitized } = provider.toObject();
        return sanitized;
      } else {
        await this.providerRepository.findOneAndUpdate({_id:providerId},{verificationStatus:"rejected"});
        const html = `
  <p>Dear ${provider.name},</p>
  <p>Unfortunately, your verification request has been <strong>rejected</strong>. Please review your documents and try again.</p>
  <p>Admin notes</p>
  <p>${adminNotes}</p>
  <p>Feel free to contact our support team for assistance.</p>
`;
await this.verificationRepository.findOneAndUpdate({providerId},{adminNotes});
await this.mailService.sendWelcomeEmail(provider.email, "Verification Failed", html);
      }
    } catch (error) {
      console.error("Error verifying provider:", error);
      throw error;
    }
  }
  

async toggleListing(id: string): Promise<Partial<IServiceProvider> | undefined> {
  try {
    const provider = await this.providerRepository.findOne({_id:id});
    if (!provider) return undefined;
    const updatedProvider = await this.providerRepository.updateById(id, {
      isListed: !provider.isListed,
    });

    if (!updatedProvider) return undefined;
    return {
      name: updatedProvider.name,
      email: updatedProvider.email,
      phone: updatedProvider.phone,
      isListed: updatedProvider.isListed,
    };
  } catch (error) {
    throw new Error("The toggle listing failed");
  }
}

}
