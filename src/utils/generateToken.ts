import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string,role:string): string => {
  return jwt.sign({ id: userId,role }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
};


export const generateRefreshToken = (userId: string,role:string): string => {
  return jwt.sign({ id: userId,role }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "30d", 
  });
};
