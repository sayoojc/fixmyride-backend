import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import redis from "../config/redisConfig";
import { StatusCode } from "../enums/statusCode.enum";
import UserModel from "../models/user.model"; // Adjust imports for your actual user models
import ProviderModel from "../models/provider.model";


interface CustomJwtPayload {
  id: string;
  email: string;
  role: string;
}

const getUserByRole = async (role: string, id: string) => {
  switch (role) {
    case "user":
      return await UserModel.findById(id);
    case "provider":
      return await ProviderModel.findById(id);
    case "admin":
      return await UserModel.findById(id);
    default:
      return null;
  }
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies.accessToken;
    let userPayload: CustomJwtPayload;

    if (!token) {
      console.log('no token');
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
       res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "No tokens found. Please login again.",
        });
         return 
      }

      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as CustomJwtPayload;
        userPayload = decodedRefresh;
      } catch (err) {
       res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
         return 
      }

      const redisKey = `refreshToken:${userPayload.role}:${userPayload.id}`;
      const storedToken = await redis.get(redisKey);
      if (!storedToken || storedToken !== refreshToken) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Session expired. Please login again.",
        });
        return 
      }

      // 🔒 Check block status
      const user = await getUserByRole(userPayload.role, userPayload.id);
      if (!user || !user.isListed) {
         res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Your account is blocked. Contact support.",
        });
        return
      }

      // ✅ Issue new access token
      const newAccessToken = jwt.sign(
        {
          id: userPayload.id,
          email: userPayload.email,
          role: userPayload.role,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      return next();
    }

    // ✅ Access token exists
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as CustomJwtPayload;

    const redisKey = `refreshToken:${decoded.role}:${decoded.id}`;
    const exists = await redis.get(redisKey);

    if (!exists) {
       res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: "Session expired. Please login again.",
      });
      return
    }

    // 🔒 Check block status again here
    const user = await getUserByRole(decoded.role, decoded.id);
    if (!user || !user.isListed) {
      res.status(StatusCode.FORBIDDEN).json({
        success: false,
        message: "Your account is blocked. Contact support.",
      });
       return
    }

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(StatusCode.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized. Please login again.",
    });
  }
};
