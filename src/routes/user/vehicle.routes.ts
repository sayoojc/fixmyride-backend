import express from "express";
import container from "../../containers/container.config";
import { IUserVehicleController } from "../../interfaces/controllers/user/IUserVehicleController";
import { TYPES } from "../../containers/types";
import { verifyUser } from "../../middlewares/verify-role";
const router = express.Router();

const vehicleController = container.get<IUserVehicleController>(
  TYPES.UserVehicleController
);

router.post("/vehicles", verifyUser, (req, res) =>
  vehicleController.addVehicle(req, res)
);
router.get("/vehicles", verifyUser, (req, res) =>
  vehicleController.getVehicle(req, res)
);

export default router;
