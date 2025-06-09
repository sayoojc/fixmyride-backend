import express from "express";
import container from "../../containers/container.config";
import { verifyToken } from "../../middlewares/verify-token";
import { IAdminServicePackageController } from "../../interfaces/controllers/admin/IAdminServicePackageController";
import { TYPES } from "../../containers/types";
const router = express.Router();
const adminservicePackageController =
  container.get<IAdminServicePackageController>(
    TYPES.AdminServicePackageController
  );

router.post("/add-service-package", verifyToken, (req, res) =>
  adminservicePackageController.addServicePackage(req, res)
);
router.get("/get-service-packages", verifyToken, (req, res) =>
  adminservicePackageController.getServicePackages(req, res)
);
router.patch("/update-service-package", verifyToken, (req, res) =>
  adminservicePackageController.updateServicePackage(req, res)
);
router.patch("/toggle-block-status", verifyToken, (req, res) =>
  adminservicePackageController.toggleBlockStatus(req, res)
);

export default router;
