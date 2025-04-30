import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import redis from "../config/redisConfig";
import { StatusCode } from "../enums/statusCode.enum";

interface CustomJwtPayload {
  id: string;
  email: string;
  role: string;
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies.accessToken;
    let decodedRefresh: JwtPayload | string;
    let user;
    if (!token) {
      // Try to get refresh token
      const refreshToken = req.cookies.refreshToken;
     
      try {
        decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
        user = decodedRefresh as CustomJwtPayload;
      } catch (err) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
        return 
      }

      if (!refreshToken) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "No tokens found. Please login again.",
        });
        return 
      }

      // Verify the refresh token
    
   
     
      const redisKey = `refreshToken:${user.role}:${user.id}`;
      const storedToken = await redis.get(redisKey);

      if (!storedToken || storedToken !== refreshToken) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Session expired. Please login again.",
        });
        return 
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      // Set it back to cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 min
      });

      // Proceed to the next middleware or controller
      return next();
    }

    // If accessToken exists, verify it
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as CustomJwtPayload;
    const redisKey = `refreshToken:${decoded.role}:${decoded.id}`;
    const exists = await redis.get(redisKey);

    if (!exists) {
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: "No tokens found. Please login again.",
      });
      return 
    }

    // If everything is fine, proceed to next middleware
    next();
  } catch (err) {
    res.status(StatusCode.UNAUTHORIZED).json({
      success: false,
      message: "No tokens found. Please login again.",
    });
    return 
  }
};

