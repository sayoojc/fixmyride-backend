import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserServicePackageService } from "../../services/user/servicePackage.service";
import { IUserServicePackageController } from "../../interfaces/controllers/user/IUserServicePackageController";
import { GetServicePackagesResponseDTO,ErrorResponse,GetServicePackagesResponseSchema } from "../../dtos/controllers/user/userServicePackage.dto";

@injectable()
export class UserServicePackageController implements IUserServicePackageController {
  constructor(
    @inject(UserServicePackageService) private userServicePackageService: UserServicePackageService
  ) {}

   async getServicePackages(
     req: Request,
     res: Response<GetServicePackagesResponseDTO | ErrorResponse>
   ): Promise<void> {
     try {
       const servicePackages =
         await this.userServicePackageService.getServicePackages();
        
       const response = {
         success: true,
         message: "Service packages fetched successfully",
         servicePackages
       };
       const validate = GetServicePackagesResponseSchema.safeParse(response);
       if (!validate.success) {
         console.log(
           "the response dto is not getting validated for hte get Service packages",validate.error
         );
         res.status(400).json({
           success: false,
           message: "The response dto doesnt match",
         });
         return 
       }
       res.status(200).json(response);
     } catch (error) {
       res
         .status(400)
         .json({ success: false, message: (error as Error).message });
     }
   }
}
