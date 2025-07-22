import express from "express";
import container from "../../containers/container.config";
import { IUserAddressController } from "../../interfaces/controllers/user/IUserAddressController";
import { TYPES } from "../../containers/types";
import { verifyUser } from "../../middlewares/verify-role";

const router = express.Router();

const userAddressController = container.get<IUserAddressController>(
  TYPES.UserAddressController
);

router.get("/addresses",verifyUser,(req,res) => 
 userAddressController.getAddresses(req,res)
)

router.post("/addresses", verifyUser, (req, res) =>
  userAddressController.addAddress(req, res)
);

router.patch("/addresses/:id/default", verifyUser, (req, res) =>
  userAddressController.setDefaultAddress(req, res)
);

router.patch("/address/:id", verifyUser, (req, res) =>
  userAddressController.updateAddress(req, res)
);

router.delete("/addresses/:id", verifyUser, (req, res) =>
  userAddressController.deleteAddress(req, res)
);

export default router;
