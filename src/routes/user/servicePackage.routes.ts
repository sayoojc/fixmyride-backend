import express from "express";
import container from "../../containers/container";
import { verifyToken } from "../../middlewares/verify-token";
import { UserServicePackageController } from "../../controllers/user/servicePackage.controller";
const router = express.Router();

const userServicePackageController = container.get<UserServicePackageController>(UserServicePackageController)

router.get("/get-service-packages",verifyToken,(req,res) => userServicePackageController.getServicePackages(req,res));


export default router;