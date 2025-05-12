import express from "express";
import container from "../../containers/container";
import {UserProfileController} from "../../controllers/user/profile.controller";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();

const profileController = container.get<UserProfileController>(UserProfileController)


router.get("/getProfileData",verifyToken,(req,res) => profileController.getProfileData(req,res));
router.put("/update-profile",verifyToken,(req,res) => profileController.updateProfile(req,res));
router.put("/change-password",verifyToken,(req,res) => profileController.changePassword(req,res));


export default router;