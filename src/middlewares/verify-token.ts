import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import redis from "../config/redisConfig";
import { StatusCode } from "../enums/statusCode.enum";
import UserModel from "../models/user.model";
import ProviderModel from "../models/provider.model";
import { RESPONSE_MESSAGES } from "../constants/response.messages";

export interface CustomJwtPayload {
  id: string;
  email: string;
  role: "user" | "admin" | "provider";
}

const getUserByRole = async (role: string, id: string) => {
  switch (role) {
    case "user":
    case "admin":
      return await UserModel.findById(id);
    case "provider":
      return await ProviderModel.findById(id);
    default:
      return null;
  }
};

export const authenticate = async (
  req: Request,
  res: Response
): Promise<CustomJwtPayload | null> => {
  let token = req.cookies.accessToken;
  let userPayload: CustomJwtPayload;

  if (!token) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res
        .status(StatusCode.UNAUTHORIZED)
        .json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
      return null;
    }

    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as CustomJwtPayload;
      userPayload = decodedRefresh;
    } catch {
      res
        .status(StatusCode.UNAUTHORIZED)
        .json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
      return null;
    }

    const redisKey = `refreshToken:${userPayload.role}:${userPayload.id}`;
    const storedToken = await redis.get(redisKey);
    if (!storedToken || storedToken !== refreshToken) {
      res
        .status(StatusCode.UNAUTHORIZED)
        .json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
      return null;
    }

    const user = await getUserByRole(userPayload.role, userPayload.id);
    if (!user) {
      res
        .status(StatusCode.FORBIDDEN)
        .json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
      return null;
    }
    if (!user.isListed) {
      res
        .status(StatusCode.FORBIDDEN)
        .json({ message: RESPONSE_MESSAGES.ACCOUNT_IS_BLOCKED });
      return null;
    }
    const { id, email, role } = userPayload;
    const newAccessToken = jwt.sign(
      { id, email, role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return userPayload;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as CustomJwtPayload;
    const user = await getUserByRole(decoded.role, decoded.id);
    if (!user) {
      res
        .status(StatusCode.FORBIDDEN)
        .json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
      return null;
    }
    if (!user.isListed) {
      res
        .status(StatusCode.FORBIDDEN)
        .json({ message: RESPONSE_MESSAGES.ACCOUNT_IS_BLOCKED });
      return null;
    }
    return decoded;
  } catch (err) {
    res
      .status(StatusCode.UNAUTHORIZED)
      .json({ message: RESPONSE_MESSAGES.UNAUTHORIZED });
    return null;
  }
};
