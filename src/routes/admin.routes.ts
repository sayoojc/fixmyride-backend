import express from "express";
import container from "../containers/container";
import {AdminController} from "../controllers/admin.controller";
import { verifyToken } from "../middlewares/verify-token";
const router = express.Router();

const adminController = container.get<AdminController>(AdminController)


router.get("/getData",verifyToken,(req,res) => adminController.fetchUsers(req,res));

router.patch('/toggleListing',verifyToken,(req,res) => adminController.toggleListing(req,res));

router.post('/add-brand',verifyToken,(req,res) => adminController.addBrand(req,res));

router.get('/get-brands',verifyToken,(req,res) => adminController.getBrands(req,res));

router.post('/add-model',verifyToken,(req,res) => adminController.addModel(req,res));

router.patch('/toggle-brand-status',verifyToken,(req,res) => adminController.toggleBrandStatus(req,res));

router.patch('/update-brand',verifyToken,(req,res) => adminController.updateBrand(req,res));


export default router;