import express from "express";
import container from "../../containers/container";
import { ProviderProfileController } from "../../controllers/provider/profile.controller";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();

const providerProfileController = container.get<ProviderProfileController>(ProviderProfileController)


router.get("/get-profile-data",verifyToken,(req,res) => providerProfileController.getProfileData(req,res));
router.post("/verify-provider",verifyToken,(req,res) => providerProfileController.verifyProvider(req,res));
router.patch("/update-profile",verifyToken,(req,res) => providerProfileController.updateProfile(req,res));



export default router;