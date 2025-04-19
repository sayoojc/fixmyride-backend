
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { UserService } from "../services/user.services";
import  jwt, { JwtPayload }  from "jsonwebtoken";



@injectable()
export class UserController {
    constructor(
      @inject(UserService) private userService:UserService
    ){}
    async getProfileData(req:Request,res:Response):Promise<void> {

      let accessToken = req.cookies.accessToken;
      if(!accessToken) {
         res.status(401).json({message:"Not authorized,no access token"});
         return
      }

      try {
        
        let userDetails = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET!)
        const user = userDetails as JwtPayload
        if(!user){
            throw new Error('Failed to Authenticate')
        }
        const sanitizedUser = await this.userService.getProfileData(user.id);
        console.log('The sanitized user from the user controller',sanitizedUser);
        res.status(200).json({ 
          success: true, 
          message: "user fetched successfully",
          user:sanitizedUser
        });
  
      } catch (error) {
        res.status(400).json({message:(error as Error).message})
      }
    }
    async getBrands(req:Request,res:Response):Promise<void>{
      try {
        console.log('The get brands function from the backend controller function');
        const brands = await this.userService.getBrands();
        res.status(200).json({
          success: true,
          message: `Brands fetched successfully`,
          brand: brands
      })
      } catch (error) {
        res.status(400).json({message:(error as Error).message})

      }
      }

  
    
   
    

}