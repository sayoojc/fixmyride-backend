import express from "express";
import container from "../../containers/container.config";
import { verifyToken } from "../../middlewares/verify-token";
import { IAdminUserController } from "../../interfaces/controllers/admin/IAdminUserController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const adminUserController = container.get<IAdminUserController>(
  TYPES.AdminUserController
);

router.get("/get-users", verifyToken, (req, res) =>
  adminUserController.fetchUsers(req, res)
);

router.patch("/toggle-user-listing", verifyToken, (req, res) =>
  adminUserController.toggleListing(req, res)
);

export default router;
