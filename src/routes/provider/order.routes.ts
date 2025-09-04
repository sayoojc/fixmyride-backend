import express from "express";
import container from "../../containers/container.config";
import { verifyProvider } from "../../middlewares/verify-role";
import { IProviderOrderController } from "../../interfaces/controllers/provider/IProviderOrderController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const providerOrderController = container.get<IProviderOrderController>(
  TYPES.ProviderOrderController
);
router.get("/order/history",verifyProvider,(req,res) => {
  providerOrderController.getOrders(req,res)
})
router.get("/order/:id", verifyProvider, (req, res) =>
  providerOrderController.getOrderData(req, res)
);
router.patch("/order/:id", verifyProvider, (req, res) =>
  providerOrderController.updateOrderStatus(req, res)
);

export default router;
