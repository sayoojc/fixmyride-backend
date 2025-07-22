import express from "express";
import container from "../../containers/container.config";
import { verifyAdmin } from "../../middlewares/verify-role";
import { IAdminUserController } from "../../interfaces/controllers/admin/IAdminUserController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const adminUserController = container.get<IAdminUserController>(
  TYPES.AdminUserController
);

router.get("/users", verifyAdmin, (req, res) =>
  adminUserController.fetchUsers(req, res)
);

router.patch("/users/:email", verifyAdmin, (req, res) =>
  adminUserController.toggleListing(req, res)
);

export default router;
