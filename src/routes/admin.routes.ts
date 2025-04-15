import express from "express";
import container from "../containers/container";
import {AdminController} from "../controllers/admin.controller";
import { verifyToken } from "../middlewares/verify-token";
const router = express.Router();

const adminController = container.get<AdminController>(AdminController)


router.get("/getData",verifyToken,(req,res) => adminController.fetchUsers(req,res));

router.patch('/toggleListing',verifyToken,(req,res) => adminController.toggleListing(req,res));


export default router;