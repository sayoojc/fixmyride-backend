import express from "express";
import container from "../../containers/container.config";
import { verifyUser } from "../../middlewares/verify-role";
import { IUserServicePackageController } from "../../interfaces/controllers/user/IUserServicePackageController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const userServicePackageController =
  container.get<IUserServicePackageController>(
    TYPES.UserServicePackageController
  );

router.get("/service-packages", verifyUser, (req, res) =>
  userServicePackageController.getServicePackages(req, res)
);
router.get("/service-packages/:id", verifyUser, (req, res) =>
  userServicePackageController.getServicePackageById(req, res)
);

export default router;
