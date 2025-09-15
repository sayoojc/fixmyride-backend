import express from "express";
import container from "../../containers/container.config";
import { verifyUser } from "../../middlewares/verify-role";
import { IUserNotificationController } from "../../interfaces/controllers/user/IUserNotificationController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const userNotificationController = container.get<IUserNotificationController>(
  TYPES.UserNotificationController
);

router.get("/notifications", verifyUser, (req, res) =>
  userNotificationController.fetchNotifications(req, res)
);
router.get("/notifications/count",verifyUser,(req,res) => 
 userNotificationController.getUnreadCount(req,res)
)
router.patch("/notifications/:id", verifyUser, (req, res) =>
  userNotificationController.markNotificationAsRead(req, res)
);
router.patch("/notifications/:id/unread", verifyUser, (req, res) =>
  userNotificationController.markNotificationAsUnread(req, res)
);
router.delete("/notifications/:id", verifyUser, (req, res) =>
  userNotificationController.deleteNotification(req, res)
);
router.patch("/notifications",verifyUser,(req,res) => 
userNotificationController.markAllAsRead(req,res)
)

export default router;

