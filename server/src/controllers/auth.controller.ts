import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";
import { prisma } from "../config/database";
import { TokenPayload } from "../utils/jwt";

/**
 * Handle Google OAuth callback
 */
export const handleGoogleCallback = (req: AuthRequest, res: Response): void => {
  const user = req.user as any;

  if (!user) {
    console.error("❌ No user found after Google OAuth");
    res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
    return;
  }

  try {
    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // Set HTTP-only cookies for security
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log(
      `✅ User logged in successfully: ${user.email} (Role: ${user.role})`
    );

    // Redirect to frontend dashboard
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("❌ Error generating tokens:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=token_generation_failed`
    );
  }
};

/**
 * Get current authenticated user profile
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // User is already attached by authenticateToken middleware
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = (
  req: AuthRequest,
  res: Response
): Response | void => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token required",
    });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    // Set new cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(`✅ Tokens refreshed for user: ${decoded.email}`);

    res.json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

/**
 * Logout user (clear cookies)
 */
export const logout = (req: AuthRequest, res: Response): void => {
  const userEmail = req.user?.email;

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  console.log(`✅ User logged out: ${userEmail}`);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * Get user statistics (example protected endpoint)
 */
export const getUserStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const stats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            interviews: true,
            resumes: true,
            experiences: true,
            submissions: true,
          },
        },
      },
    });

    res.json({
      success: true,
      stats: stats?._count || {
        interviews: 0,
        resumes: 0,
        experiences: 0,
        submissions: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
    });
  }
};
