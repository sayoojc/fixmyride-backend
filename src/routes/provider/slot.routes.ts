import express from "express";
import container from "../../containers/container.config";
import { verifyProvider } from "../../middlewares/verify-role";
import { IProviderSlotController } from "../../interfaces/controllers/provider/IProviderSlotController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const providerSlotController = container.get<IProviderSlotController>(
  TYPES.ProviderSlotController
);

router.get("/slots", verifyProvider, (req, res) =>
  providerSlotController.getSlots(req, res)
);
router.patch("/slots",verifyProvider,(req,res) => 
providerSlotController.updateSlots(req,res));
export default router;
