import express from "express";
import container from "../../containers/container.config";
import { IProviderProfileController } from "../../interfaces/controllers/provider/IProviderProfileController";
import { verifyToken } from "../../middlewares/verify-token";
import { TYPES } from "../../containers/types";
const router = express.Router();

const providerProfileController = container.get<IProviderProfileController>(
  TYPES.ProviderProfileController
);

router.get("/get-profile-data", verifyToken, (req, res) =>
  providerProfileController.getProfileData(req, res)
);
router.post("/verify-provider", verifyToken, (req, res) =>
  providerProfileController.verifyProvider(req, res)
);
router.patch("/update-profile", verifyToken, (req, res) =>
  providerProfileController.updateProfile(req, res)
);

export default router;
