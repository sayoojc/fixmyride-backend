import passport from "passport";
import { Response, Request } from "express";
import { IUser } from "../models/user.model";
import { IServiceProvider } from "../models/provider.model";
import redis from "../config/redisConfig";


export const authenticateGoogle = (req: Request, res: Response, next: Function) => {
  const type = (req.query.state || (req as any).state ) as string;

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: type,
  })(req, res, next);
};

export const googleCallback = passport.authenticate("google", {
  session: false,
  failureRedirect: `/`,
});

export const googleController = async (req: Request, res: Response): Promise<void> => {

  if (!req.user) {
    res.status(400).json({ error: "Authentication failed" });
    return 
  }
  const { provider,user, accessToken, refreshToken } = req.user as {
    user?: IUser;
    provider?: IServiceProvider;
    accessToken: string;
    refreshToken: string;
  };
  if(user){
    const refreshTokenKey = `refreshToken:user:${user._id}`;
    const refreshTokenExpirySeconds = 7 * 24 * 60 * 60;
    await redis.set(refreshTokenKey, refreshToken, 'EX', refreshTokenExpirySeconds);
  } else if(provider){
    const refreshTokenKey = `refreshToken:provider:${provider._id}`;
    const refreshTokenExpirySeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    await redis.set(refreshTokenKey, refreshToken, 'EX', refreshTokenExpirySeconds);
  
  }

  res.cookie("accessToken",accessToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  
  res.send(`
    <script>
      window.opener.postMessage(${JSON.stringify({
        id: user?._id || provider?._id,
        name: user?.name || provider?.name,
        role: user ? "user" : "provider",
        email: user?.email || provider?.email,
      })}, "${process.env.CLIENT_URL}");
      window.close();
    </script>
  `);
  
};