import type { CustomJwtPayload } from "../middlewares/verify-token";

declare global {
  namespace Express {
    interface Request {
      userData?: CustomJwtPayload
    }
  }
}
