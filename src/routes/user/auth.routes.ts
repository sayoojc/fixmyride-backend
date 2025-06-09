import express from "express";
import container from "../../containers/container.config";
import { IUserAuthController } from "../../interfaces/controllers/user/IUserAuthController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const userauthController = container.get<IUserAuthController>(
  TYPES.UserAuthController
);

/**
 * @route   POST /register-temp
 * @desc    Temporary storage for user signup
 * @access  Public
 */
router.post("/register-temp", (req, res) =>
  userauthController.registerTemp(req, res)
);

/**
 * @route   POST /signup
 * @desc    User registration (permanent storage)
 * @access  Public
 */
router.post("/signup", (req, res) => userauthController.register(req, res));

/**
 * @route   POST /login
 * @desc    User login
 * @access  Public
 */
router.post("/login", (req, res) => userauthController.userLogin(req, res));

/**
 * @route   POST /logout
 * @desc    User logout
 * @access  Public
 */
router.post("/logout", (req, res) => userauthController.logout(req, res));

router.post("/forgotPassword", (req, res) =>
  userauthController.forgotPassword(req, res)
);

router.post("/reset-password", (req, res) =>
  userauthController.resetPassword(req, res)
);

export default router;
