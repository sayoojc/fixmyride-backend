
import { inject,injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IUserProviderService } from "../../interfaces/services/user/IUserProviderService";
import { IProviderRepository } from "../../interfaces/repositories/IProviderRepository";
import { ICityRepository } from "../../interfaces/repositories/ICityRepository";
import { IServiceProviderDTO } from "../../dtos/controllers/user/userProvider.controller.dto";
import { IServiceProvider } from "../../models/provider.model";
function toServiceProviderDTO(provider: IServiceProvider): IServiceProviderDTO {
  return {
    _id: provider._id.toString(),
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
        private readonly _providerRepository: IProviderRepository,
        private readonly _cityRepository: ICityRepository
    ) {}
  async getProviders(query: string, location: string): Promise<IServiceProviderDTO[]> {
  // 1️⃣ Find city directly
  const city = await this._cityRepository.findOne({
    name: new RegExp(`^${location}$`, "i"),
  });

  if (!city) {
    throw new Error(`City "${location}" not found in Kerala cities`);
  }

  // 2️⃣ Build geo filter (longitude first!)
  const geoFilter = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [city.long, city.lat], // ✅ correct order
        },
        $maxDistance: 100000, // 100 km (adjust as needed)
      },
    },
  };

  // 3️⃣ Build search filter if query is present
  const searchFilter =
    query && query.trim().length > 0
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { ownerName: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { "address.city": { $regex: query, $options: "i" } },
            { "address.street": { $regex: query, $options: "i" } },
          ],
        }
      : {};

  // 4️⃣ Combine filters
  const filter = {
    ...geoFilter,
    ...searchFilter,
    isListed: true,
  };

  // 5️⃣ Fetch providers
  const providers = await this._providerRepository.find(filter);

  if (!providers?.length) {
    return [];
  }

  // 6️⃣ Map to DTOs
  return providers.map(toServiceProviderDTO);
}


}