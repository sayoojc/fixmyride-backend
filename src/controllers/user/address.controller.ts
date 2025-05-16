import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { UserAddressService } from "../../services/user/address.service";
import { IUserAddressController } from "../../interfaces/controllers/user/IUserAddressController";

@injectable()
export class UserAddressController implements IUserAddressController {
  constructor(
    @inject(UserAddressService) private userService: UserAddressService
  ) {}

  async addAddress(req: Request, res: Response): Promise<void> {
    try {
      const addressData = req.body.address;
      const newAddress = await this.userService.addAddress(addressData);
      res.status(201).json({
        success: true,
        message: "Address added successfully",
        address: newAddress,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async setDefaultAddress(req: Request, res: Response): Promise<void> {
    try {
      const { addressId, userId } = req.body;
      const newAddress = await this.userService.setDefaultAddress(
        addressId,
        userId
      );
      res.status(200).json({
        success: true,
        message: "Address set as default successfully",
        address: newAddress,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const { addressForm, _id, userId } = req.body;
      const updatedAddress = await this.userService.updateAddress(
        addressForm,
        _id,
        userId
      );
      res
        .status(200)
        .json({
          message: "Address updated successfully",
          address: updatedAddress,
        });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const { addressId, userId } = req.query;
      if (!addressId || !userId) {
        res.status(400).json({ message: "addressId and userId are required" });
        return;
      }

      const addressIdStr = Array.isArray(addressId) ? addressId[0] : addressId;
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;

      if (typeof addressIdStr !== "string" || typeof userIdStr !== "string") {
        res
          .status(400)
          .json({ message: "addressId and userId must be strings" });
        return;
      }

      const response = await this.userService.deleteAddress(
        addressIdStr,
        userIdStr
      );

      if (response.success) {
        res.status(200).json({ message: "Address deleted successfully" });
      } else {
        res.status(404).json({ message: "Address not found" });
      }
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while deleting the address",
        error: (error as Error).message,
      });
    }
  }
}
