import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import {TYPES} from '../../containers/types'
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUserVehicleService } from "../../interfaces/services/user/IUserVehicleService";
import { IUserVehicleController } from "../../interfaces/controllers/user/IUserVehicleController";
import { 
  AddVehicleRequestDTO,
  AddVehicleResponseDTO,
  AddVehicleResponseSchema,
  ErrorResponse,
  AddVehicleRequestSchema,
  GetVehicleResponseDTO,
  GetVehicleResponseSchema

} from "../../dtos/controllers/user/userVehicle.controller.dto";

@injectable()
export class UserVehicleController implements IUserVehicleController {
  constructor(
    @inject(TYPES.UserVehicleService) private readonly userVehicleService: IUserVehicleService
  ) {}

  async addVehicle(req: Request<{},{},AddVehicleRequestDTO>, res: Response<AddVehicleResponseDTO | ErrorResponse>): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res.status(401).json({success:false, message: "Not authorized, no access token" });
      return;
    }
    const parsed = AddVehicleRequestSchema.safeParse(req.body);
    if(!parsed.success) {
       res.status(400).json({
          success:false,
          message:"Invalid input " + parsed.error.message,
        });
        return 
    }
    const { brandId, brandName, modelId, modelName, fuelType } = parsed.data;
    try {
      const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user) {
        throw new Error("Failed to Authenticate");
      }

      const newVehicle = await this.userVehicleService.addVehicle(
        user.id,
        brandId,
        brandName,
        modelId,
        modelName,
        fuelType
      );
      if (!newVehicle) {
        res.status(400).json({
          success: false,
          message: "Adding vehicle failed",
        });
        return 
      }
      const response = {
          success: true,
          message: "Vehicle added successfully",
          vehicle: newVehicle,
        }
        const validate = AddVehicleResponseSchema.safeParse(response);
        if(!validate.success){
          console.log('The add vehicle response dto doesnt match',validate.error.message);
   res.status(400).json({
          success: false,
          message: "Vehicle add Response dto doesnt match",
        });
        return
        }
       res.status(201).json(response);
    } catch (error) {
      res.status(400).json({success:false,message: (error as Error).message });
    }
  }
  async getVehicle(req:Request,res:Response<GetVehicleResponseDTO | ErrorResponse>){
    try {
      const accessToken = req.cookies.accessToken;
       if (!accessToken) {
      res.status(401).json({success:false, message: "Not authorized, no access token" });
      return;
    }
          const userDetails = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );
      const user = userDetails as JwtPayload;

      if (!user) {
        throw new Error("Failed to Authenticate");
      }
    const vehicleArray = await this.userVehicleService.getVehicle(user.id);
    if(!vehicleArray){
      throw new Error('Error fetching the vehicles');
    }
    const response = {
          success: true,
          message: "Vehicles fetched successfully",
          vehicles: vehicleArray,
        }
        const validate = GetVehicleResponseSchema.safeParse(response);
        if(!validate.success) {
                res.status(400).json({success:false, message: "Response Schema doesnt match." })
        }
     res.status(201).json(response);

    } catch (error) {
      res.status(400).json({success:false,message:'Fetching vehicles failed'});
    }
  }
}
