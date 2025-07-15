import express from "express";
import container from "../../containers/container.config";
import { IUserOrderController } from "../../interfaces/controllers/user/IUserOrderController";
import { TYPES } from "../../containers/types";
import { verifyUser } from "../../middlewares/verify-role";
const router = express.Router();
const orderController = container.get<IUserOrderController>(
  TYPES.UserOrderController
);


router.post("/create-razorpay-order",verifyUser, (req, res) => {
  orderController.createRazorpayOrder(req, res);
});
router.post("/verify-payment", verifyUser, (req, res) => {
  orderController.verifyRazorpayPayment(req, res);
});

export default router;
