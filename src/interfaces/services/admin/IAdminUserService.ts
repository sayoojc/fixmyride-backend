type SanitizedUser = {
  name: string;
  email: string;
  phone?: string;
  role: string;
  isListed: boolean;
};

export interface IAdminUserService {
  fetchUsers(): Promise<SanitizedUser[] | undefined>;

  toggleListing(email: string): Promise<SanitizedUser | undefined>;
}
