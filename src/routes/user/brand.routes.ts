import express from "express";
import container from "../../containers/container.config";
import { IUserBrandController } from "../../interfaces/controllers/user/IUserBrandController";
import { TYPES } from "../../containers/types";
import { verifyUser } from "../../middlewares/verify-role";
const router = express.Router();

const userController = container.get<IUserBrandController>(
  TYPES.UserBrandController
);

router.get("/get-brands", verifyUser, (req, res) =>
  userController.getBrands(req, res)
);
router.get("/get-brand-model-data", verifyUser, (req, res) =>
  userController.getBrands(req, res)
);

export default router;
