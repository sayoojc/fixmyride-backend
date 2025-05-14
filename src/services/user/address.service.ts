import { UserRepository } from "../../repositories/user.repo";
import { IAddress } from "../../models/adress.model";
import { AddressRepository } from "../../repositories/address.repo";
import mongoose from "mongoose";

export class UserAddressService {
   constructor(
        private userRepository:UserRepository,
        private addressRepository:AddressRepository,
    ){}
 
   
          async addAddress(addressData:IAddress):Promise<IAddress>{
            try {
              const newAddress = this.addressRepository.create(addressData);
              return newAddress;
            } catch (error) {
              throw new Error('Adding address is failed');
            }
          }
          async setDefaultAddress(addressId: string,userId: string, ): Promise<void> {
            console.log('The user id and address id from teh service function ',userId,addressId)
            console.log('The setDefault address service function');
            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
              throw new Error("Invalid userId or addressId");
            }
          
       
            
            const targetAddress = await this.addressRepository.findOne({ 
              _id:addressId, 
              userId: userId 
            });
            
            console.log('The target address',targetAddress);
            if (!targetAddress) {
              console.log('no targetAddress');
              throw new Error("Address not found");
            }
          
            // Step 1: Set that address to default
            const updatedAddress = await this.addressRepository.updateById(addressId, {
              isDefault: true,
            });
            console.log("updatedAddress", updatedAddress);
          
            // Step 2: Set all other addresses to not default
            const addresses = await this.addressRepository.updateMany(
              {
                userId: userId,
                _id: { $ne: addressId },
                isDefault: true,
              },
              {
                isDefault: false,
              }
            );
            console.log("addresses", addresses);
          
            if (!updatedAddress) {
              throw new Error("Failed to set default address");
            }
          }
          async updateAddress(addressForm:IAddress,_id:string,userId:string){
            

            // Step 1: If isDefault is true, unset any other default address for the user
            if (addressForm.isDefault) {
              await this.addressRepository.updateMany(
                { userId, isDefault: true, _id: { $ne: _id } },
                { $set: { isDefault: false } }
              );
            }
          
            // Step 2: Update the given address
            const updatedAddress = await this.addressRepository.updateById(_id, {
              ...addressForm,
            });
          
            if (!updatedAddress) {
              throw new Error('Address not found or update failed');
            }
          
            return updatedAddress;
          }
          async deleteAddress(addressId: string, userId: string) {
            try {
                // Fetch the user by userId
                const user = await this.userRepository.findOne({_id:userId});
                
                // If user doesn't exist, throw an error
                if (!user) {
                    throw new Error('User not found');
                }
        
                // Attempt to delete the address by addressId
                const addressDeleted = await this.addressRepository.deleteById(addressId);
                
                // If no address was deleted, return an error
                if (!addressDeleted) {
                    throw new Error('Address not found or could not be deleted');
                }
        
                return { success: true, message: 'Address deleted successfully' };
            } catch (error) {
                // Handle any errors that occur during the process
                console.error('Error in deleting address:', error);
                throw new Error(`An error occurred while deleting the address: ${(error as Error).message}`);
            }
        }
        
         
        
}