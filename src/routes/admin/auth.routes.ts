import express from "express";
import container from "../../containers/container";
import { AdminAuthController } from "../../controllers/admin/auth.controller";
import { authenticateGoogle } from "../../services/googleServices";
import { googleCallback,googleController } from "../../services/googleServices";

const router = express.Router();

const adminAuthController = container.get<AdminAuthController>(AdminAuthController);

/**
 * @route   POST /login
 * @desc    Admin login
 * @access  Public
 */
router.post("/adminlogin", (req, res) => adminAuthController.adminLogin(req, res));


/**
 * @route   POST /adminlogout
 * @desc    Admin logout
 * @access  Public
 */
router.post("/adminlogout", (req, res) => adminAuthController.adminLogout(req, res));


export default router;
