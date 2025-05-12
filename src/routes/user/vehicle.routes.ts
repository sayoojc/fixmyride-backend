import express from "express";
import container from "../../containers/container";
import {UserVehicleController} from "../../controllers/user/vehicle.controller";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();

const vehicleController = container.get<UserVehicleController>(UserVehicleController)


router.post("/add-vehicle",verifyToken,(req,res) => vehicleController.addVehicle(req,res));


export default router;