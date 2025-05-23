import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserVehicleService } from "../../services/user/vehicle.service";
import { IUserVehicleController } from "../../interfaces/controllers/user/IUserVehicleController";
import { 
  AddVehicleRequestDTO,
  AddVehicleResponseDTO,
  AddVehicleResponseSchema,
  ErrorResponse,
  AddVehicleRequestSchema

} from "../../dtos/controllers/user/userVehicle.controller.dto";

@injectable()
export class UserVehicleController implements IUserVehicleController {
  constructor(
    @inject(UserVehicleService) private userVehicleService: UserVehicleService
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
      if (newVehicle) {
        res.status(201).json({
          success: true,
          message: "Vehicle added successfully",
          vehicle: newVehicle,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Adding vehicle failed",
        });
      }
    } catch (error) {
      res.status(400).json({success:false,message: (error as Error).message });
    }
  }
}
