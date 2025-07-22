import express from "express";
import container from "../../containers/container.config";
import { verifyAdmin } from "../../middlewares/verify-role";
import { IAdminProviderController } from "../../interfaces/controllers/admin/IAdminProviderController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const adminProviderController = container.get<IAdminProviderController>(
  TYPES.AdminProviderController
);

router.get("/providers", verifyAdmin, (req, res) =>
  adminProviderController.fetchProviders(req, res)
);
router.get("/provider/:id", verifyAdmin, (req, res) =>
  adminProviderController.fetchProviderById(req, res)
);
router.get("/verification/:id", verifyAdmin, (req, res) =>
  adminProviderController.fetchVerificationData(req, res)
);
router.patch("/verification/:id", verifyAdmin, (req, res) =>
  adminProviderController.verifyProvider(req, res)
);
router.patch("/provider/:id", verifyAdmin, (req, res) =>
  adminProviderController.toggleListing(req, res)
);

export default router;
