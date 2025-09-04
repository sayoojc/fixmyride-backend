import express from "express";
import container from "../../containers/container.config";
import { verifyAdmin } from "../../middlewares/verify-role";
import { IAdminOrderController } from "../../interfaces/controllers/admin/IAdminOrderController";
import { TYPES } from "../../containers/types";
const router = express.Router();

const adminOrderController = container.get<IAdminOrderController>(
  TYPES.AdminOrderController   
);  

router.get("/orders", verifyAdmin, (req, res) =>
  adminOrderController.fetchOrders(req, res)
);
router.get("/orders/:id", verifyAdmin, (req, res) =>
  adminOrderController.fetchOrderById(req, res)
);


export default router;