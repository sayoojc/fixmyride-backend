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
router.get("/notifications/count",verifyAdmin,(req,res) => 
 adminNotificationController.getUnreadCount(req,res)
)
router.patch("/notifications/:id", verifyAdmin, (req, res) =>
  adminNotificationController.markNotificationAsRead(req, res)
);
router.patch("/notifications/:id/unread", verifyAdmin, (req, res) =>
  adminNotificationController.markNotificationAsUnread(req, res)
);
router.delete("/notifications/:id", verifyAdmin, (req, res) =>
  adminNotificationController.deleteNotification(req, res)
);
router.patch("/notifications",verifyAdmin,(req,res) => 
adminNotificationController.markAllAsRead(req,res)
)

export default router;

