import express from "express";
import container from "../../containers/container";
import { UserAddressController } from "../../controllers/user/address.controller";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();

const userAddressController = container.get<UserAddressController>(UserAddressController)


router.post("/add-address",verifyToken,(req,res) => userAddressController.addAddress(req,res));


router.patch("/set-default-address",verifyToken,(req,res) => userAddressController.setDefaultAddress(req,res));

router.patch("/update-address",verifyToken,(req,res) => userAddressController.updateAddress(req,res));

router.delete("/delete-address",verifyToken,(req,res) => userAddressController.deleteAddress(req,res));

export default router;
