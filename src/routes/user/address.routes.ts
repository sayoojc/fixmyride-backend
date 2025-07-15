import express from "express";
import container from "../../containers/container.config";
import { IUserAddressController } from "../../interfaces/controllers/user/IUserAddressController";
import { TYPES } from "../../containers/types";
import { verifyUser } from "../../middlewares/verify-role";

const router = express.Router();

const userAddressController = container.get<IUserAddressController>(
  TYPES.UserAddressController
);

router.get("/get-addresses",verifyUser,(req,res) => 
 userAddressController.getAddresses(req,res)
)

router.post("/add-address", verifyUser, (req, res) =>
  userAddressController.addAddress(req, res)
);

router.patch("/set-default-address", verifyUser, (req, res) =>
  userAddressController.setDefaultAddress(req, res)
);

router.patch("/update-address", verifyUser, (req, res) =>
  userAddressController.updateAddress(req, res)
);

router.delete("/delete-address", verifyUser, (req, res) =>
  userAddressController.deleteAddress(req, res)
);

export default router;
