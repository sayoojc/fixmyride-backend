import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserVehicleService } from "../../services/user/vehicle.service";

@injectable()
export class UserVehicleController {
  constructor(@inject(UserVehicleService) private userVehicleService: UserVehicleService) {}

  async addVehicle(req: Request, res: Response): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res.status(401).json({ message: "Not authorized, no access token" });
      return;
    }
     const  {brandId,brandName,modelId,modelName,fuelType} = req.body;
     console.log('the vehicle data from teh vehicle controller function',req.body)
    try {
      const userDetails = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
      const user = userDetails as JwtPayload;

      if (!user) {
        console.log('no user');
        throw new Error("Failed to Authenticate");
      }

      const newVehicle = await this.userVehicleService.addVehicle(user.id,brandId,brandName,modelId,modelName,fuelType);
      console.log('new vehicle',newVehicle)
      if(newVehicle) {
        console.log('The if block')
   res.status(201).json({
        success: true,
        message: "Vehicle added successfully",
        vehicle: newVehicle,
      });
      } else {
        console.log('The else block in hte add vehicle controller')
         res.status(400).json({
        success: false,
        message: "Adding vehicle failed",
        
      });
      }
   
    } catch (error) {
      console.log('the catch block from the add vehicle contorller')
      res.status(400).json({ message: (error as Error).message });
    }
  }


}
