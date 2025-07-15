import express from "express";
import container from "../../containers/container.config";
import { IProviderProfileController } from "../../interfaces/controllers/provider/IProviderProfileController";
import { verifyProvider } from "../../middlewares/verify-role";
import { TYPES } from "../../containers/types";
const router = express.Router();

const providerProfileController = container.get<IProviderProfileController>(
  TYPES.ProviderProfileController
);

router.get("/get-profile-data", verifyProvider, (req, res) =>
  providerProfileController.getProfileData(req, res)
);
router.post("/verify-provider", verifyProvider, (req, res) =>
  providerProfileController.verifyProvider(req, res)
);
router.patch("/update-profile", verifyProvider, (req, res) =>
  providerProfileController.updateProfile(req, res)
);

export default router;
