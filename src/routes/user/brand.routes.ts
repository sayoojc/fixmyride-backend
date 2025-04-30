import express from "express";
import container from "../../containers/container";
import {UserBrandController} from "../../controllers/user/brand.controller";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();

const userController = container.get<UserBrandController>(UserBrandController)


router.get("/get-brands",verifyToken,(req,res) => userController.getBrands(req,res));

export default router;