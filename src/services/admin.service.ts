
import { IBrand } from "../models/brand.model";
import {IModel} from "../models/model.model";
import { ModelRepository } from "../repositories/model.repo";
import { UserRepository } from "../repositories/user.repo";
import { BrandRepository } from "../repositories/brand.repo";
import mongoose from "mongoose";
type SanitizedUser = {
    name:string;
    email:string;
    phone?:string;
    role:string;
    isListed:boolean;
}

export class AdminService {
    private userRepository:UserRepository;
    private brandRepository:BrandRepository;
    private modelRepository:ModelRepository;

    constructor(
        userRepository:UserRepository,
        brandRepository:BrandRepository,
        modelRepository:ModelRepository
    ){
        this.userRepository = userRepository
        this.brandRepository = brandRepository
        this.modelRepository = modelRepository
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
                isListed: updatedUser.isListed, 
              };
            console.log('The updated user',updatedUser);
            return sanitizedUser
        } catch (error) {
            throw new Error('The toggle listing failed')
        }
    }
    async addBrand(brandName:string,imageUrl:string):Promise<IBrand> {
        try {
            const existingBrand = await this.brandRepository.findBrandByName(brandName);
            if(existingBrand){
            throw new Error('Brand trying to create is already existing');
            }
            const newBrand = await this.brandRepository.createBrand({brandName,imageUrl})
            return newBrand
        } catch (error) {
            throw new Error('Adding new brand failed');
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
      async addModel(model:string,imageUrl:string,brandId:string):Promise<IModel> {
        try {
          let name = model;
            const existingModel = await this.modelRepository.findModelByName(model);
            if(existingModel){
            throw new Error('Brand trying to create is already existing');
            }
            const brandObjectId = new mongoose.Types.ObjectId(brandId);

            const newModel = await this.modelRepository.createModel({
              name,
              imageUrl,
              brandId:brandObjectId
            })
            return newModel
        } catch (error) {
            throw new Error('Adding new brand failed');
        }
    }
    async toggleBrandStatus(brandId:string,newStatus:string):Promise<IBrand | null> {
      try {
        const updatedBrand = this.brandRepository.updateById(brandId,{status:newStatus})
        return updatedBrand;
      } catch (error) {
        throw new Error('Toggle brand Status failed');
      }
    }
    async updateBrand(id:string,name:string,imageUrl:string):Promise<IBrand | null> {
      try {
        const updatedBrand = this.brandRepository.updateById(id,{brandName:name,imageUrl})
        return updatedBrand
      } catch (error) {
        throw new Error('update Brand function failed');

      }
    }
}