import express from "express";
import container from "../../containers/container.config";
import { verifyProvider } from "../../middlewares/verify-role";
import { IProviderOrderController } from "../../interfaces/controllers/provider/IProviderOrderController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const providerOrderController = container.get<IProviderOrderController>(
  TYPES.ProviderOrderController
);

router.get("/order/:id", verifyProvider, (req, res) =>
  providerOrderController.getOrderData(req, res)
);

export default router;
