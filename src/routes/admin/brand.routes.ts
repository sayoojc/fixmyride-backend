import express from "express";
import container from "../../containers/container";

import { verifyToken } from "../../middlewares/verify-token";
import { AdminBrandController } from "../../controllers/admin/brand.controller";
const router = express.Router();


const brandController = container.get<AdminBrandController>(AdminBrandController)




router.post('/add-brand',verifyToken,(req,res) => brandController.addBrand(req,res));
router.get('/get-brands',verifyToken,(req,res) => brandController.getBrands(req,res));
router.patch('/toggle-brand-status',verifyToken,(req,res) => brandController.toggleBrandStatus(req,res));
router.patch('/update-brand',verifyToken,(req,res) => brandController.updateBrand(req,res));



export default router;