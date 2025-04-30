import express from "express";
import container from "../../containers/container";
import {AdminUserController} from "../../controllers/admin/user.controller";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();

const adminUserController = container.get<AdminUserController>(AdminUserController);


router.get("/get-users",verifyToken,(req,res) => adminUserController.fetchUsers(req,res));

router.patch('/toggle-user-listing',verifyToken,(req,res) => adminUserController.toggleListing(req,res));

export default router;


