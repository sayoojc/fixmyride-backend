import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { inject, injectable } from "inversify";
import { AuthService } from "../services/auth.service";


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

@injectable()
export class VerifyTokenMiddleware {


  constructor(
    @inject(AuthService) private authService: AuthService
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized: No tokens provided" });
    }

    try {
      // ✅ Verify Access Token
      const decodedAccess = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as { userId: string };
      req.user = { userId: decodedAccess.userId };
      return next();
    } catch (accessTokenError) {
      console.log("Access token invalid or expired:", accessTokenError);

      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized: No refresh token provided" });
      }

      try {
        // ✅ Verify Refresh Token
        const decodedRefresh = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: string };

        const storedTokens = await this.authService.validateToken(decodedRefresh.userId);

        const validToken = storedTokens.find((token) => token.token === refreshToken);

        if (!validToken) {
          return res.status(403).json({ message: "Forbidden: Invalid refresh token" });
        }

        // 🔥 Generate new Access Token
        const newAccessToken = jwt.sign(
          { userId: decodedRefresh.userId },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        req.cookies.accessToken = newAccessToken;
        req.user = { userId: decodedRefresh.userId };
        next();
      } catch (refreshTokenError) {
        console.error("Refresh token invalid:", refreshTokenError);
        return res.status(403).json({ message: "Forbidden: Invalid refresh token" });
      }
    }
  }
}
