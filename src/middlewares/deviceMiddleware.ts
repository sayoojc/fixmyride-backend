import { Request, Response, NextFunction } from "express";

// Middleware to collect device info
export const deviceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers["user-agent"] || "Unknown";
  const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";

  // Attach device info to the request object
  req.body.deviceInfo = {
    userAgent,
    ipAddress,
  };

  next();
};
