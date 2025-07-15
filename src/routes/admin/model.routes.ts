import express from "express";
import container from "../../containers/container.config";
import { TYPES } from "../../containers/types";
import { verifyAdmin } from "../../middlewares/verify-role";
import { IAdminModelController } from "../../interfaces/controllers/admin/IAdminModelController";
const router = express.Router();

const modelController = container.get<IAdminModelController>(
  TYPES.AdminModelController
);

router.post("/add-model", verifyAdmin, (req, res) =>
  modelController.addModel(req, res)
);

router.patch("/toggle-model-status", verifyAdmin, (req, res) =>
  modelController.toggleModelStatus(req, res)
);

router.patch("/update-model", verifyAdmin, (req, res) =>
  modelController.updateModel(req, res)
);

export default router;
