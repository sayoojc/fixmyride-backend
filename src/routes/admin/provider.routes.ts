import express from "express";
import container from "../../containers/container";
import { verifyToken } from "../../middlewares/verify-token";
import { AdminProviderController } from "../../controllers/admin/provider.controller";

const router = express.Router();

const adminProviderController = container.get<AdminProviderController>(AdminProviderController);


router.get("/get-providers",verifyToken,(req,res) => adminProviderController.fetchProviders(req,res));
router.get("/get-provider",verifyToken,(req,res) => adminProviderController.fetchProviderById(req,res));
router.get("/get-verification-data",verifyToken,(req,res) => adminProviderController.fetchVerificationData(req,res));
router.patch("/verify-provider",verifyToken,(req,res) => adminProviderController.verifyProvider(req,res));
router.patch('/toggle-provider-listing',verifyToken,(req,res) => adminProviderController.toggleListing(req,res));

export default router;


