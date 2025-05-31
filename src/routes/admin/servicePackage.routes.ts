import express from "express";
import container from "../../containers/container";
import { verifyToken } from "../../middlewares/verify-token";
import { AdminServicePackageController } from "../../controllers/admin/servicePackage.controller";
const router = express.Router();
const adminservicePackageController = container.get<AdminServicePackageController>(AdminServicePackageController)


router.post('/add-service-package',verifyToken,(req,res) => adminservicePackageController.addServicePackage(req,res));
router.get('/get-service-packages',verifyToken,(req,res) => adminservicePackageController.getServicePackages(req,res));
router.patch('/update-service-package',verifyToken,(req,res) => adminservicePackageController.updateServicePackage(req,res));
router.patch('/toggle-block-status',verifyToken,(req,res) => adminservicePackageController.toggleBlockStatus(req,res))

export default router;