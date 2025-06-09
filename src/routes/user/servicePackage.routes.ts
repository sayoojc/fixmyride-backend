import express from "express";
import container from "../../containers/container.config";
import { verifyToken } from "../../middlewares/verify-token";
import { IUserServicePackageController } from "../../interfaces/controllers/user/IUserServicePackageController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const userServicePackageController =
  container.get<IUserServicePackageController>(
    TYPES.UserServicePackageController
  );

router.get("/get-service-packages", verifyToken, (req, res) =>
  userServicePackageController.getServicePackages(req, res)
);

export default router;
