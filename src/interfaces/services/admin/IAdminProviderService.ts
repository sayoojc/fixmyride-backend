import { IServiceProvider } from "../../../models/provider.model";
import { IVerification } from "../../../models/verification.model";

export interface IAdminProviderService {
fetchProviders({
  search,
  skip,
  limit,
  statusFilter,
}: {
  search: string;
  skip: number;
  limit: number;
  statusFilter: string;
}): Promise<{ sanitizedProviders: Partial<IServiceProvider>[],totalCount: number } | undefined>;


  fetchVerificationData(id: string): Promise<IVerification | null>;

  fetchProviderById(id: string): Promise<Partial<IServiceProvider> | undefined>;

  verifyProvider(
    providerId: string,
    verificationAction: string,
    adminNotes: string
  ): Promise<Partial<IServiceProvider> | undefined>;

  toggleListing(id: string): Promise<Partial<IServiceProvider> | undefined>;
}
