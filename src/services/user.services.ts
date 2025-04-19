import { UserRepository } from "../repositories/user.repo";
import { BrandRepository } from "../repositories/brand.repo";
import { ModelRepository } from "../repositories/model.repo";
import { IBrand } from "../models/brand.model";
import {IModel} from "../models/model.model";

type SanitizedUser = {
    name:string;
    email:string;
    phone?:string;
    role:string;
    isListed:boolean;
}

export class UserService {
    private userRepository:UserRepository;
    private brandRepository:BrandRepository;
    private modelRepository:ModelRepository

    constructor(
        userRepository:UserRepository,
        brandRepository:BrandRepository,
        modelRepository:ModelRepository
    ){
        this.userRepository = userRepository
        this.brandRepository = brandRepository
        this.modelRepository = modelRepository
    }
    async getProfileData(id:string):Promise<SanitizedUser|undefined>{
        try {
            const user = await this.userRepository.findOne({_id:id})
            if(!user){
                throw new Error('User details not found')
            }
          const sanitizedUser = {
            id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role,
            isListed:user.isListed
          }  
          return sanitizedUser
        } catch (error) {
            console.error("Error fetching users:", error);
            return undefined;
        }
    }
     async getBrands(): Promise<(IBrand & { models: IModel[] })[]> {
            try {
              console.log('get brands service function');
          
              const brands = await this.brandRepository.find();
              console.log('brands', brands);
          
              const brandsWithModels = await Promise.all(
                brands.map(async (brand) => {
                  const models = await this.modelRepository.find({ brandId: brand._id });
                  return {
                    ...brand.toObject(),
                    models,
                  };
                })
              );
          
              console.log('brands with models:', brandsWithModels);
              return brandsWithModels;
          
            } catch (error) {
              console.error('Error fetching brands with models:', error);
              throw new Error('Fetching brands with models failed');
            }
          }
   
}