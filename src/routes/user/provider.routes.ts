import express from 'express';
import container from '../../containers/container.config';
import { IUserProviderController } from '../../interfaces/controllers/user/IUserProviderController';
import { TYPES } from '../../containers/types';
import { verifyUser } from '../../middlewares/verify-role';
const router = express.Router();

const providerController = container.get<IUserProviderController>(
  TYPES.UserProviderController
);
router.get('/providers', verifyUser, (req, res) =>
  providerController.getProviders(req, res)
);

export default router;