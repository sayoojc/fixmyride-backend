import { IServiceProvider } from "../../../models/provider.model";
import {
  Providerdata,
  TempProvider,
} from "../../../interfaces/Provider.interface";
import { SanitizedProvider } from "../../../interfaces/Provider.interface";
export interface IProviderAuthService {
  providerRegisterTemp(providerData: Providerdata): Promise<TempProvider>;

  providerRegister(providerData: {
    email: string;
    otp: string;
    phone: string;
  }): Promise<IServiceProvider | null>;

  providerLogin(
    email: string,
    password: string
  ): Promise<{
    sanitizedProvider: SanitizedProvider;
    accessToken: string;
    refreshToken: string;
  }>;
}
