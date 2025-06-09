import express from "express";
import container from "../../containers/container.config";
import { TYPES } from "../../containers/types";
import { verifyToken } from "../../middlewares/verify-token";
import { IAdminModelController } from "../../interfaces/controllers/admin/IAdminModelController";
const router = express.Router();

const modelController = container.get<IAdminModelController>(
  TYPES.AdminModelController
);

router.post("/add-model", verifyToken, (req, res) =>
  modelController.addModel(req, res)
);

router.patch("/toggle-model-status", verifyToken, (req, res) =>
  modelController.toggleModelStatus(req, res)
);

router.patch("/update-model", verifyToken, (req, res) =>
  modelController.updateModel(req, res)
);

export default router;
