import { IServiceProvider } from "../../../models/provider.model";
import { SanitizedProvider, VerificationFormData } from "../../../interfaces/Provider.interface";

export interface IProviderProfileService {
  getProfileData(id: string): Promise<SanitizedProvider | undefined>;

  verifyProvider(data: VerificationFormData, providerId: string): Promise<any>;

  updateProfile(data: Partial<IServiceProvider>): Promise<IServiceProvider | null>;
}
