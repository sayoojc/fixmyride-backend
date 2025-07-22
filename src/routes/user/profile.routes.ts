import express from "express";
import container from "../../containers/container.config";
import { IUserProfileController } from "../../interfaces/controllers/user/IUserProfileController";
import { TYPES } from "../../containers/types";
import { verifyUser } from "../../middlewares/verify-role";
const router = express.Router();

const profileController = container.get<IUserProfileController>(
  TYPES.UserProfileController
);

router.get("/profile", verifyUser, (req, res) =>
  profileController.getProfileData(req, res)
);
router.put("/profile", verifyUser, (req, res) =>
  profileController.updateProfile(req, res)
);
router.put("/profile/password", verifyUser, (req, res) =>
  profileController.changePassword(req, res)
);

export default router;
