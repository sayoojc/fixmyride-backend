import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { UserBrandService } from "../../services/user/brand.service";
import { IUserBrandController } from "../../interfaces/controllers/user/IUserBrandController";

@injectable()
export class UserBrandController implements IUserBrandController {
  constructor(
    @inject(UserBrandService) private userBrandService: UserBrandService
  ) {}

  async getBrands(req: Request, res: Response): Promise<void> {
    try {
      const brands = await this.userBrandService.getBrands();
      res.status(200).json({
        success: true,
        message: "Brands fetched successfully",
        brand: brands,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}
