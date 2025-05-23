import { IServiceProvider } from "../../../models/provider.model";
import { SanitizedProvider, VerificationFormData } from "../../../interfaces/Provider.interface";
import { UpdateProfileRequestDTO } from "../../../dtos/controllers/provider/providerProfile.controller.dto";
export interface IProviderProfileService {
  getProfileData(id: string): Promise<SanitizedProvider | undefined>;

  verifyProvider(data: VerificationFormData, providerId: string): Promise<any>;

  updateProfile(data: UpdateProfileRequestDTO): Promise<IServiceProvider | null>;
}
