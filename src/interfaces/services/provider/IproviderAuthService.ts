import { IServiceProvider } from "../../../models/provider.model";
import { Providerdata, TempProvider } from "../../../interfaces/Provider.interface";

export interface IProviderAuthService {
  providerRegisterTemp(providerData: Providerdata): Promise<TempProvider>;

  providerRegister(providerData: Providerdata): Promise<IServiceProvider | null>;

  providerLogin(
    email: string,
    password: string
  ): Promise<{
    provider: IServiceProvider;
    accessToken: string;
    refreshToken: string;
  }>;
}
