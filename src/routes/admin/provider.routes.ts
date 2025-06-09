import express from "express";
import container from "../../containers/container.config";
import { verifyToken } from "../../middlewares/verify-token";
import { IAdminProviderController } from "../../interfaces/controllers/admin/IAdminProviderController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const adminProviderController = container.get<IAdminProviderController>(
  TYPES.AdminProviderController
);

router.get("/get-providers", verifyToken, (req, res) =>
  adminProviderController.fetchProviders(req, res)
);
router.get("/get-provider", verifyToken, (req, res) =>
  adminProviderController.fetchProviderById(req, res)
);
router.get("/get-verification-data", verifyToken, (req, res) =>
  adminProviderController.fetchVerificationData(req, res)
);
router.patch("/verify-provider", verifyToken, (req, res) =>
  adminProviderController.verifyProvider(req, res)
);
router.patch("/toggle-provider-listing", verifyToken, (req, res) =>
  adminProviderController.toggleListing(req, res)
);

export default router;
