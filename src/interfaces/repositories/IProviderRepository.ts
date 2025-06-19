import { IBaseRepository } from "./IBaseRepository";
import { IServiceProvider } from "../../models/provider.model";
import { VerificationFormData } from "../Provider.interface";
type CombinedType = VerificationFormData & {
  status: string;
  submittedAt: Date;
};
export interface IProviderRepository extends IBaseRepository<IServiceProvider> {
  createUserFromGoogle(
    googleId: string,
    name: string,
    email: string
  ): Promise<IServiceProvider>;
   findWithQuery(query: any): Promise<IServiceProvider[]>;
    countDocuments(query: any): Promise<number>;
    findWithPagination(query: any, skip: number, limit: number): Promise<IServiceProvider[]>;
}
