import express from "express";
import container from "../containers/container";
import {UserController} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verify-token";
const router = express.Router();

const userController = container.get<UserController>(UserController)


router.get("/getProfileData",verifyToken,(req,res) => userController.getProfileData(req,res));

router.get("/get-brands",verifyToken,(req,res) => userController.getBrands(req,res));



export default router;