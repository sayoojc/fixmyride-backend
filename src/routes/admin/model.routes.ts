import express from "express";
import container from "../../containers/container";

import { verifyToken } from "../../middlewares/verify-token";
import { AdminModelController } from "../../controllers/admin/model.controller";
const router = express.Router();


const modelController = container.get<AdminModelController>(AdminModelController)

router.post('/add-model',verifyToken,(req,res) => modelController.addModel(req,res));

router.patch('/toggle-model-status',verifyToken,(req,res) => modelController.toggleModelStatus(req,res));

router.patch('/update-model',verifyToken,(req,res) => modelController.updateModel(req,res));





export default router;