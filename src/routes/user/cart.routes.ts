import express from "express";
import container from "../../containers/container.config";
import { IUserCartController } from "../../interfaces/controllers/user/IUserCartController";
import { TYPES } from "../../containers/types";
import { verifyUser } from "../../middlewares/verify-role";
const router = express.Router();
const cartController = container.get<IUserCartController>(
  TYPES.UserCartController
);
router.get("/cart", verifyUser, (req, res) =>
  cartController.getCart(req, res)
);

router.post("/cart/services", verifyUser, (req, res) =>
  cartController.addToCart(req, res)
);

router.delete("/cart/:cartId/services/:packageId", verifyUser, (req, res) =>
  cartController.removeFromCart(req, res)
);

router.post("/cart/vehicle", verifyUser, (req, res) =>
  cartController.addVehicleToCart(req, res)
);

export default router;
