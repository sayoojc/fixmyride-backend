import express from "express";
import container from "../containers/container";
import {AdminController} from "../controllers/admin.controller";
const router = express.Router();

const adminController = container.get<AdminController>(AdminController)


router.get("/getData",(req,res) => adminController.fetchUsers(req,res));

router.patch('/toggleListing',(req,res) => adminController.toggleListing(req,res));


export default router;