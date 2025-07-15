import express from "express";
import container from "../../containers/container.config";
import { IUserCartController } from "../../interfaces/controllers/user/IUserCartController";
import { TYPES } from "../../containers/types";
import { verifyUser } from "../../middlewares/verify-role";
const router = express.Router();
const cartController = container.get<IUserCartController>(
  TYPES.UserCartController
);
router.get("/get-cart",verifyUser,(req,res) =>
  cartController.getCart(req,res)
);

router.patch("/add-to-cart", verifyUser, (req, res) =>
  cartController.addToCart(req, res)
);
router.patch("/remove-service-from-cart", verifyUser, (req, res) =>
  cartController.removeFromCart(req, res)
);
router.post("/add-vehicle-to-cart", verifyUser, (req, res) =>
  cartController.addVehicleToCart(req, res)
);
export default router;
