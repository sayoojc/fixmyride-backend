import passport from "passport";
import { Response, Request } from "express";
import { IUser } from "../models/user.model";
import redis from "../config/redisConfig";


export const authenticateGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCallback = passport.authenticate("google", {
  session: false,
  failureRedirect: `/`,
});

export const googleController = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(400).json({ error: "Authentication failed" });
    return 
  }
  const { user, accessToken, refreshToken } = req.user as {
    user: IUser;
    accessToken: string;
    refreshToken: string;
  };
  const { name, role, id } = user;
  const refreshTokenKey = `refreshToken:user:${user._id}`;
  const refreshTokenExpirySeconds = 7 * 24 * 60 * 60;
  await redis.set(refreshTokenKey, refreshToken, 'EX', refreshTokenExpirySeconds);
  res.cookie("accessToken",accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  
  res.send(`
    <script>
      window.opener.postMessage({name: '${name}',role:'${role}' ,id:'${id}' }, "${process.env.CLIENT_URL}");
      console.log("Closing window");
      window.close();
    </script>
  `);
};