import express from "express";
import container from "../../containers/container"
import { UserCartController } from "../../controllers/user/cart.controller";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();
const cartController = container.get<UserCartController>(UserCartController);

// router.post("/add-to-cart",verifyToken,(req,res) => cartController.addToCart(req,res));
router.post("/add-vehicle-to-cart",verifyToken,(req,res) => cartController.addVehicleToCart(req,res));
export default router;
