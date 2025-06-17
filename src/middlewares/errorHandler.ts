import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
 
  logger.error({
    message: err.message || 'Unhandled error',
    error: err.stack || err.toString(),
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user || 'anonymous',
    body: req.body,
    params: req.params,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      referer: req.headers.referer
    }
  });

  // Determine response status and message
  const status = err.statusCode || 500;
  const message = status === 500 
    ? 'Internal Server Error' 
    : err.message || 'Something went wrong';

  // Send error response
  res.status(status).json({ 
    success: false, 
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};