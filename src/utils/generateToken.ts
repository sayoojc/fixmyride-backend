import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string,role:string): string => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m", // Short lifespan
  });
};

// Generate Refresh Token (Long-Lived: 30 Days)
export const generateRefreshToken = (userId: string,role:string): string => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "30d", // Long lifespan
  });
};
