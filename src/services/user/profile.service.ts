import { UserRepository } from "../../repositories/user.repo";
import { AddressRepository } from "../../repositories/address.repo";
import { formatAddress } from "../../utils/address";

type SanitizedUser = {
  name: string;
  email: string;
  phone?: string;
  role: string;
  isListed: boolean;
};

export class UserProfileService {
  constructor(private userRepository: UserRepository,private addressRepository:AddressRepository) {}
async getProfileData(id:string):Promise<SanitizedUser|undefined>{
        try {
            const user = await this.userRepository.findOne({_id:id});
            const addresses = await this.addressRepository.find({userId:id});
            const defaultAddressObject = addresses.find((address) => address.isDefault === true);
            const defaultAddress = defaultAddressObject ? formatAddress(defaultAddressObject) : "";
            
            if(!user){
                throw new Error('User details not found')
            }
          const sanitizedUser = {
            id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role,
            isListed:user.isListed,
            addresses:addresses,
            defaultAddress
          }  
          return sanitizedUser
        } catch (error) {
            console.error("Error fetching users:", error);
            return undefined;
        }
    }
  async fetchUsers(): Promise<SanitizedUser[] | undefined> {
    try {
      const users = await this.userRepository.find({ role: { $ne: 'admin' } });
      return users.map((user) => ({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isListed: user.isListed,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return undefined;
    }
  }

  async toggleListing(email: string): Promise<SanitizedUser | undefined> {
    try {
      const user = await this.userRepository.findOne({ email });
      if (!user) return undefined;

      const updatedUser = await this.userRepository.updateById(user._id.toString(), {
        isListed: !user.isListed,
      });

      if (!updatedUser) return undefined;

      return {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isListed: updatedUser.isListed,
      };
    } catch (error) {
      throw new Error("The toggle listing failed");
    }
  }
}
