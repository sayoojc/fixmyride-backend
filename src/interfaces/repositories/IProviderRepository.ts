import { IBaseRepository } from "./IBaseRepository";
import { IServiceProvider } from "../../models/provider.model";

export interface IProviderRepository extends IBaseRepository<IServiceProvider> {
  createUserFromGoogle(
    googleId: string,
    name: string,
    email: string
  ): Promise<IServiceProvider>;
}
