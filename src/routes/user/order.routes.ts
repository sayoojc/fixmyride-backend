import express from "express";
import container from "../../containers/container.config";
import { IUserOrderController } from "../../interfaces/controllers/user/IUserOrderController";
import { TYPES } from "../../containers/types";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();
const orderController = container.get<IUserOrderController>(
  TYPES.UserOrderController
);


router.post("/create-razorpay-order",verifyToken, (req, res) => {
  orderController.createRazorpayOrder(req, res);
});
router.post("/verify-payment", verifyToken, (req, res) => {
  orderController.verifyRazorpayPayment(req, res);
});

export default router;
