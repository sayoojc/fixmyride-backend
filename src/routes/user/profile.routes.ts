import express from "express";
import container from "../../containers/container.config";
import { IUserProfileController } from "../../interfaces/controllers/user/IUserProfileController";
import { TYPES } from "../../containers/types";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();

const profileController = container.get<IUserProfileController>(
  TYPES.UserProfileController
);

router.get("/getProfileData", verifyToken, (req, res) =>
  profileController.getProfileData(req, res)
);
router.put("/update-profile", verifyToken, (req, res) =>
  profileController.updateProfile(req, res)
);
router.put("/change-password", verifyToken, (req, res) =>
  profileController.changePassword(req, res)
);

export default router;
