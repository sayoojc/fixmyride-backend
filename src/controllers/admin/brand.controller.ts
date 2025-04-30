import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { AdminBrandService } from "../../services/admin/brand.service";

@injectable()
export class AdminBrandController {
  constructor(
    @inject(AdminBrandService) private adminBrandService: AdminBrandService
  ) {}

  async addBrand(req: Request, res: Response): Promise<void> {
    try {
      let { brandName, imageUrl } = req.body;
      brandName = brandName[0].toUpperCase() + brandName.slice(1).toLowerCase();
      const newBrand = await this.adminBrandService.addBrand(brandName, imageUrl);
      res.status(201).json({
        success: true,
        message: `Brand ${newBrand.brandName} is created`,
        brand: newBrand,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getBrands(req: Request, res: Response): Promise<void> {
    try {
      console.log('The get brands function from the brand controllers');
      const brands = await this.adminBrandService.getBrands();
      res.status(200).json({
        success: true,
        message: "Brands fetched successfully",
        brand: brands
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async toggleBrandStatus(req: Request, res: Response): Promise<void> {
    try {
      const { brandId, newStatus } = req.body;
      const updatedBrand = await this.adminBrandService.toggleBrandStatus(brandId, newStatus);

      if (!updatedBrand) {
        res.status(404).json({ success: false, message: 'Brand not found or failed to update status' });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Brand ${updatedBrand.brandName} status changed to ${updatedBrand.status}`,
        brand: updatedBrand
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async updateBrand(req: Request, res: Response): Promise<void> {
    try {
      const { id, name, imageUrl } = req.body;

      if (!id || !name || !imageUrl) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const updatedBrand = await this.adminBrandService.updateBrand(id, name, imageUrl);

      if (!updatedBrand) {
        res.status(404).json({ message: "Brand not found" });
        return;
      }

      res.status(200).json({
        message: "Brand updated successfully",
        brand: updatedBrand
      });

    } catch (error) {
      console.error("Error updating brand:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

