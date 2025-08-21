import { IServiceProviderDTO } from "../../../dtos/controllers/user/userProvider.controller.dto";

export interface IUserProviderService {
    getProviders(query: string, location: string): Promise<IServiceProviderDTO[]>;
}