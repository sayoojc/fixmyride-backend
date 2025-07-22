import express from "express";
import container from "../../containers/container.config";
import { IAdminAuthController } from "../../interfaces/controllers/admin/IAdminAuthController";
import { TYPES } from "../../containers/types";

const router = express.Router();

const adminAuthController = container.get<IAdminAuthController>(
  TYPES.AdminAuthController
);

/**
 * @route   POST /login
 * @desc    Admin login
 * @access  Public
 */
router.post("/login", (req, res) =>
  adminAuthController.adminLogin(req, res)
);

/**
 * @route   POST /adminlogout
 * @desc    Admin logout
 * @access  Public
 */
router.post("/logout", (req, res) => adminAuthController.adminLogout(req, res));

export default router;
