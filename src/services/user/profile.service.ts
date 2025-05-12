import { UserRepository } from "../../repositories/user.repo";
import { AddressRepository } from "../../repositories/address.repo";
import { VehicleRepository } from "../../repositories/vehicle.repo";
import { formatAddress } from "../../utils/address";
import bcrypt from 'bcrypt'

type SanitizedUser = {
  name: string;
  email: string;
  phone?: string;
  role: string;
  isListed: boolean;
};

export class UserProfileService {
  constructor(
    private userRepository: UserRepository,
    private addressRepository:AddressRepository,
    private vehicleRepository:VehicleRepository
  ) {}
async getProfileData(id:string):Promise<SanitizedUser|undefined>{
        try {
            const user = await this.userRepository.findOne({_id:id});
            const addresses = await this.addressRepository.find({userId:id});
            const defaultAddressObject = addresses.find((address) => address.isDefault === true);
            const defaultAddress = defaultAddressObject ? formatAddress(defaultAddressObject) : "";
            const vehicles = await this.vehicleRepository.findVehicleDataPopulatedByUserId(user?.id)
           console.log('vehicles',vehicles);


            
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
            provider:user.provider,
            addresses:addresses,
            defaultAddress,
            vehicles
          }  
          return sanitizedUser
        } catch (error) {
            console.error("Error fetching users:", error);
            return undefined;
        }
    }
    async updateProfile(phone:string,userId:string,userName:string):Promise<Partial<SanitizedUser>|undefined>{
      try {
          const user = await this.userRepository.findOneAndUpdate({_id:userId},{phone,name:userName});
          
          if(!user){
              throw new Error('User details not found')
          }
        const sanitizedUser = {
          name:user.name,
          phone:user.phone,
       }  
        return sanitizedUser
      } catch (error) {
          console.error("Error updating profile:", error);
          return undefined;
      }
  }
  async changePassword(userId:string,currentPassword:string,newPassword:string):Promise<Partial<SanitizedUser>|undefined>{
    try {
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
     
      if (!user.password) {
        throw new Error("Password is not set for this user");
      }
      // 2. Compare current password with the stored one
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
  
      // 3. Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // 4. Update the user with the new password
      user.password = hashedPassword;
      await user.save();
  
      // 5. Return sanitized user
      const sanitizedUser: Partial<SanitizedUser> = {
        name: user.name,
        phone: user.phone,
      };
  
      return sanitizedUser;
    } catch (error) {
        console.error("Error fetching users:", error);
        return undefined;
    }
}
 
}
