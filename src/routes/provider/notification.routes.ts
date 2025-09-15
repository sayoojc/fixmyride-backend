import express from "express";
import container from "../../containers/container.config";
import { IProviderNotificationController } from "../../interfaces/controllers/provider/IProviderNotificationController";
import { verifyProvider } from "../../middlewares/verify-role";
import { TYPES } from "../../containers/types";
const router = express.Router();

const providerNotificationController =
  container.get<IProviderNotificationController>(
    TYPES.ProviderNotificationController
  );

router.get("/notifications", verifyProvider, (req, res) =>
  providerNotificationController.getNotifications(req, res)
);
router.patch("/notifications/:id/read", verifyProvider, (req, res) =>
  providerNotificationController.markNotificationAsRead(req, res)
);
router.patch("/notifications/:id/unread", verifyProvider, (req, res) =>
  providerNotificationController.markNotificationAsUnread(req, res)
);
router.delete("/notifications/:id", verifyProvider, (req, res) =>
  providerNotificationController.deleteNotfication(req, res)
);
router.patch("/notifications", verifyProvider, (req, res) =>
  providerNotificationController.markAllAsRead(req, res)
);
router.get("/notifications/count",verifyProvider,(req,res) => 
  providerNotificationController.getUnreadCount(req,res)
)
export default router;

