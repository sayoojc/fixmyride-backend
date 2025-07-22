import express from "express";
import container from "../../containers/container.config";
import { IProviderAuthController } from "../../interfaces/controllers/provider/IProviderAuthController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const providerAuthController = container.get<IProviderAuthController>(
  TYPES.ProviderAuthController
);

router.post("/login", (req, res) =>
  providerAuthController.providerLogin(req, res)
);

router.post("/logout", (req, res) =>
  providerAuthController.providerLogout(req, res)
);

router.post("/register-temp", (req, res) =>
  providerAuthController.providerRegisterTemp(req, res)
);

router.post("/register", (req, res) =>
  providerAuthController.providerRegister(req, res)
);

export default router;
