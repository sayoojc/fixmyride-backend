// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("💥 Error caught:", err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ success: false, message });
};


// export const errorHandler = (
//   err: Error,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Response => {
//   console.error("Error:", err.message);

//   const statusCode = (err as any).statusCode || 500;
//   const message = err.message || "Internal Server Error";

//   return res.status(statusCode).json({ message });
// };
