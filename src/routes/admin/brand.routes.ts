import express from "express";
import container from "../../containers/container.config";
import { TYPES } from "../../containers/types";
import { verifyToken } from "../../middlewares/verify-token";
import { IAdminBrandController } from "../../interfaces/controllers/admin/IAdminBrandController";
const router = express.Router();

const brandController = container.get<IAdminBrandController>(
  TYPES.AdminBrandController
);

router.post("/add-brand", verifyToken, (req, res) =>
  brandController.addBrand(req, res)
);
router.get("/get-brands", verifyToken, (req, res) =>
  brandController.getBrands(req, res)
);
router.patch("/toggle-brand-status", verifyToken, (req, res) =>
  brandController.toggleBrandStatus(req, res)
);
router.patch("/update-brand", verifyToken, (req, res) =>
  brandController.updateBrand(req, res)
);

export default router;
