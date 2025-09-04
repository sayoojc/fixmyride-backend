import express from "express";
import container from "../../containers/container.config";
import { IUserOrderController } from "../../interfaces/controllers/user/IUserOrderController";
import { TYPES } from "../../containers/types";
import { verifyUser } from "../../middlewares/verify-role";
const router = express.Router();
const orderController = container.get<IUserOrderController>(
  TYPES.UserOrderController
);


router.post("/payments/razorpay/order",verifyUser, (req, res) => {
  orderController.createRazorpayOrder(req, res);
});
router.post("/payments/razorpay/verify", verifyUser, (req, res) => {
  orderController.verifyRazorpayPayment(req, res);
});
router.post("/orders",verifyUser,(req,res) => {
  orderController.placeCashOrder(req,res)
});
router.get("/orders/history",verifyUser,(req,res) => {
  orderController.getOrderHistory(req,res)
})
router.get("/orders/:id",verifyUser,(req,res) =>{
 orderController.getOrderDetails(req,res)
});
export default router;
