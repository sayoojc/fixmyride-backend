import express from "express";
import container from "../containers/container";
import { AuthController } from "../controllers/auth.controller";

const router = express.Router();

// ✅ Resolve the AuthController instance using the DI container
const authController = container.get<AuthController>(AuthController);

/**
 * @route   POST /register-temp
 * @desc    Temporary storage for user signup
 * @access  Public
 */
router.post("/register-temp", (req, res) => authController.registerTemp(req, res));

/**
 * @route   POST /signup
 * @desc    User registration (permanent storage)
 * @access  Public
 */
router.post("/signup", (req, res) => authController.register(req, res));

/**
 * @route   POST /login
 * @desc    User login
 * @access  Public
 */
router.post("/login", (req, res) => authController.userLogin(req, res));

/**
 * @route   POST /login
 * @desc    Admin login
 * @access  Public
 */
router.post("/adminlogin", (req, res) => authController.adminLogin(req, res));

/**
 * @route   POST /login
 * @desc    Provider login
 * @access  Public
 */
router.post("/providerlogin", (req, res) => authController.providerLogin(req, res));


/**
 * @route   POST /logout
 * @desc    User logout
 * @access  Public
 */
router.post("/logout", (req, res) => authController.logout(req, res));

/**
 * @route   POST /adminlogout
 * @desc    Admin logout
 * @access  Public
 */
router.post("/adminlogout", (req, res) => authController.adminLogout(req, res));

/**
 * @route   POST /providerlogout
 * @desc    Provider logout
 * @access  Public
 */
router.post("/providerlogout", (req, res) => authController.providerLogout(req, res));



router.post("/forgotPassword",(req,res) => authController.forgotPassword(req,res));


// router.post("/resetPassword",(req,res) => authController.resetPassword(req,res));



export default router;
