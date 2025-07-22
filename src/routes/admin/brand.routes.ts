import express from "express";
import container from "../../containers/container.config";
import { TYPES } from "../../containers/types";
import { verifyAdmin } from "../../middlewares/verify-role";
import { IAdminBrandController } from "../../interfaces/controllers/admin/IAdminBrandController";
const router = express.Router();

const brandController = container.get<IAdminBrandController>(
  TYPES.AdminBrandController
);

router.post("/brands", verifyAdmin, (req, res) =>
  brandController.addBrand(req, res)
);
router.get("/brands", verifyAdmin, (req, res) =>
  brandController.getBrands(req, res)
);
router.patch("/brands/:id/status", verifyAdmin, (req, res) =>
  brandController.toggleBrandStatus(req, res)
);
router.patch("/brands/:id", verifyAdmin, (req, res) =>
  brandController.updateBrand(req, res)
);

export default router;
