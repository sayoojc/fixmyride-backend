
import { inject,injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IUserProviderService } from "../../interfaces/services/user/IUserProviderService";
import { IProviderRepository } from "../../interfaces/repositories/IProviderRepository";
import { keralaCities } from "../../constants/cityLocations";
import { IServiceProviderDTO } from "../../dtos/controllers/user/userProvider.controller.dto";
import { IServiceProvider } from "../../models/provider.model";
function toServiceProviderDTO(provider: IServiceProvider): IServiceProviderDTO {
  return {
    _id: provider._id.toString(), // ✅ convert ObjectId to string
    name: provider.name,
    email: provider.email,
    location: provider.location,
    isListed: provider.isListed,
    ownerName: provider.ownerName,
    phone: provider.phone,
    googleId: provider.googleId,
    provider: provider.provider,
    address: provider.address,
    verificationStatus: provider.verificationStatus,
    license: provider.license,
    ownerIdProof: provider.ownerIdProof,
    profilePicture: provider.profilePicture,
    coverPhoto: provider.coverPhoto,
    bankDetails: provider.bankDetails,
    startedYear: provider.startedYear,
    description: provider.description,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
  };
}

@injectable()
export class UserProviderService implements IUserProviderService {
    constructor(
        @inject(TYPES.ProviderRepository) 
        private readonly _providerRepository: IProviderRepository
    ) {}
  async getProviders(query: string, location: string): Promise<IServiceProviderDTO[]> {
    console.log('the get providers service is called',query, location);
    const city = keralaCities.find(
      (c) => c.name.toLowerCase() === location.toLowerCase()
    );
    if (!city) {
        console.log('city not found');
      throw new Error(`City ${location} not found in keralaCities`);
    }
    const geoQuery = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [city.lat,city.long],
          },
          $maxDistance: 10000000, 
        },
      },
    };
    const searchFilter =
      query && query.trim().length > 0
        ? {
            $or: [
              { name: { $regex: query, $options: "i" } },
              { ownerName: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
              { "address.city": { $regex: query, $options: "i" } },
              {"address.street": { $regex: query, $options: "i" } },
            ],
          }
        : {};

    const filter = {
      ...geoQuery,
      ...searchFilter,
      isListed: true,
    };
   console.log('reached this much');
    console.log('filter', filter);
    const providers = await this._providerRepository.find(filter);
    console.log(`Found ${providers.length} providers for query "${query}" in location "${location}"`);
    if(providers.length === 0) {
        return []
    }
    return providers.map(toServiceProviderDTO);

  }

}