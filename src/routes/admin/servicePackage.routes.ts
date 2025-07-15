import express from "express";
import container from "../../containers/container.config";
import { verifyAdmin } from "../../middlewares/verify-role";
import { IAdminServicePackageController } from "../../interfaces/controllers/admin/IAdminServicePackageController";
import { TYPES } from "../../containers/types";
const router = express.Router();
const adminservicePackageController =
  container.get<IAdminServicePackageController>(
    TYPES.AdminServicePackageController
  );

router.post("/add-service-package", verifyAdmin, (req, res) =>
  adminservicePackageController.addServicePackage(req, res)
);
router.get("/get-service-packages", verifyAdmin, (req, res) =>
  adminservicePackageController.getServicePackages(req, res)
);
router.patch("/update-service-package", verifyAdmin, (req, res) =>
  adminservicePackageController.updateServicePackage(req, res)
);
router.patch("/toggle-block-status", verifyAdmin, (req, res) =>
  adminservicePackageController.toggleBlockStatus(req, res)
);

export default router;
