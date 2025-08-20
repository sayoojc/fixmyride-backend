import express from "express";
import container from "../../containers/container.config";
import { verifyAdmin } from "../../middlewares/verify-role";
import { IAdminNotificationController } from "../../interfaces/controllers/admin/IAdminNotificationController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const adminNotificationController = container.get<IAdminNotificationController>(
  TYPES.AdminNotificationController
);

router.get("/notifications", verifyAdmin, (req, res) =>
  adminNotificationController.fetchNotifications(req, res)
);


export default router;
