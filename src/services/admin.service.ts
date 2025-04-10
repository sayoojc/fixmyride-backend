import { UserRepository } from "../repositories/user.repo";
type SanitizedUser = {
    name:string;
    email:string;
    phone:string;
    role:string;
    isListed:boolean;
}

export class AdminService {
    private userRepository:UserRepository;

    constructor(
        userRepository:UserRepository
    ){
        this.userRepository = userRepository
    }
    async fetchUsers():Promise<SanitizedUser[]|undefined>{
        try {
            const users = await this.userRepository.find({role:{$ne:'admin'}})
          const sanitizedUsers = users.map((user) => ({
            id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role,
            isListed:user.isListed
          }))   
          return sanitizedUsers
        } catch (error) {
            console.error("Error fetching users:", error);
            return undefined;
        }
    }
    async toggleListing(email:string):Promise<SanitizedUser|undefined>{
        try {
            const user = await this.userRepository.findOne({ email: email });
            if (!user) {
              return undefined
            }
            let updatedUser;
            if(user){
               updatedUser = await this.userRepository.updateById(user._id.toString(),{isListed:!user.isListed});
    
            }
            if (!updatedUser) return undefined;
            const sanitizedUser = {
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                isListed: updatedUser.isListed, // ✅ now the latest value
              };
            console.log('The updated user',updatedUser);
            return sanitizedUser
        } catch (error) {
            throw new Error('The toggle listing failed')
        }
    }
}