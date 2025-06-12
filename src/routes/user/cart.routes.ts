import express from "express";
import container from "../../containers/container.config";
import { IUserCartController } from "../../interfaces/controllers/user/IUserCartController";
import { TYPES } from "../../containers/types";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();
const cartController = container.get<IUserCartController>(
  TYPES.UserCartController
);
// router.get("/get-cart",verifyToken,(req,res) =>
//   cartController.getCart(req,res)
// );

router.patch("/add-to-cart", verifyToken, (req, res) =>
  cartController.addToCart(req, res)
);
router.patch("/remove-service-from-cart", verifyToken, (req, res) =>
  cartController.removeFromCart(req, res)
);
router.post("/add-vehicle-to-cart", verifyToken, (req, res) =>
  cartController.addVehicleToCart(req, res)
);
export default router;
