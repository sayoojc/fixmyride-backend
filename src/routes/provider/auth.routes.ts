import express from "express";
import container from "../../containers/container";
import { ProviderAuthController } from "../../controllers/provider/auth.controller";
import { googleCallback,googleController } from "../../services/googleServices";
import { authenticateGoogle } from "../../services/googleServices";

const router = express.Router();

const providerAuthController = container.get<ProviderAuthController>(ProviderAuthController);

/**
 * @route   POST /login
 * @desc    Provider login
 * @access  Public
 */
router.post("/provider-login", (req, res) => providerAuthController.providerLogin(req, res));

/**
 * @route   POST /providerlogout
 * @desc    Provider logout
 * @access  Public
 */
router.post("/providerlogout", (req, res) => providerAuthController.providerLogout(req, res));


router.post("/provider-register-temp",(req,res) => providerAuthController.providerRegisterTemp(req,res));

router.post("/provider-register",(req,res) => providerAuthController.providerRegister(req,res));


export default router;
