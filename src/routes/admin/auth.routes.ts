import express from "express";
import container from "../../containers/container";
import { AdminAuthController } from "../../controllers/admin/auth.controller";


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
router.post("/logout", (req, res) => adminAuthController.adminLogout(req, res));


export default router;
