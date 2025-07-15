import { Request, Response, NextFunction } from "express";
import { authenticate, CustomJwtPayload } from "./verify-token";
import { RESPONSE_MESSAGES } from "../constants/response.messages";

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = await authenticate(req, res);
  if (!user) return;
  if (user.role !== "user") {
    res.status(403).json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
     return
  }
  req.user = user;
  next();
};

export const verifyProvider = async (req: Request, res: Response, next: NextFunction) => {
  const user = await authenticate(req, res);
  if (!user) return;
  if (user.role !== "provider") {
  res.status(403).json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
    return 
  }
  req.user = user;
  next();
};

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = await authenticate(req, res);
  if (!user) return;
  if (user.role !== "admin") {
   res.status(403).json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
    return 
  }
  req.user = user;
  next();
};
