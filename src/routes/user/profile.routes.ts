import express from "express";
import container from "../../containers/container";
import {UserProfileController} from "../../controllers/user/profile.controller";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();

const profileController = container.get<UserProfileController>(UserProfileController)


router.get("/getProfileData",verifyToken,(req,res) => profileController.getProfileData(req,res));



export default router;