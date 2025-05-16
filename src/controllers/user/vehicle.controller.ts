import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserVehicleService } from "../../services/user/vehicle.service";
import { IUserVehicleController } from "../../interfaces/controllers/user/IUserVehicleController";

@injectable()
export class UserVehicleController implements IUserVehicleController {
  constructor(
    @inject(UserVehicleService) private userVehicleService: UserVehicleService
  ) {}

  async addVehicle(req: Request, res: Response): Promise<void> {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res.status(401).json({ message: "Not authorized, no access token" });
      return;
    }
    const { brandId, brandName, modelId, modelName, fuelType } = req.body;
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
      res.status(400).json({ message: (error as Error).message });
    }
  }
}
