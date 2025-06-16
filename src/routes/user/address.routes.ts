import express from "express";
import container from "../../containers/container.config";
import { IUserAddressController } from "../../interfaces/controllers/user/IUserAddressController";
import { TYPES } from "../../containers/types";
import { verifyToken } from "../../middlewares/verify-token";
const router = express.Router();

const userAddressController = container.get<IUserAddressController>(
  TYPES.UserAddressController
);

router.get("/get-addresses",verifyToken,(req,res) => 
 userAddressController.getAddresses(req,res)
)

router.post("/add-address", verifyToken, (req, res) =>
  userAddressController.addAddress(req, res)
);

router.patch("/set-default-address", verifyToken, (req, res) =>
  userAddressController.setDefaultAddress(req, res)
);

router.patch("/update-address", verifyToken, (req, res) =>
  userAddressController.updateAddress(req, res)
);

router.delete("/delete-address", verifyToken, (req, res) =>
  userAddressController.deleteAddress(req, res)
);

export default router;
