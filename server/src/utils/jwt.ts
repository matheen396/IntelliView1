import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}
//generate access token (15 min)
export const generateAccessToken = (payload: TokenPayload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m"});
};

//generate refresh token (7 days)
export const generateRefreshToken = (payload: TokenPayload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
}

//verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
};

//verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
};

//generate both access and refresh tokens
export const generateTokens = (payload: TokenPayload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};
