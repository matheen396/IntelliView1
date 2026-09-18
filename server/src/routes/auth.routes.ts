import express, { Request, Response, NextFunction } from "express";
import passport from "../config/passport";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import {
  handleGoogleCallback,
  getCurrentUser,
  refreshAccessToken,
  logout,
  getUserStats,
} from "../controllers/auth.controller";

const router = express.Router();

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback handler
 * @access  Public
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  ((req: Request, res: Response) =>
    handleGoogleCallback(req as AuthRequest, res)) as express.RequestHandler
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get(
  "/me",
  authenticateToken as express.RequestHandler,
  ((req: Request, res: Response) =>
    getCurrentUser(req as AuthRequest, res)) as express.RequestHandler
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token in cookie)
 */
router.post("/refresh", ((req: Request, res: Response) =>
  refreshAccessToken(req as AuthRequest, res)) as express.RequestHandler);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear cookies)
 * @access  Private
 */
router.post(
  "/logout",
  authenticateToken as express.RequestHandler,
  ((req: Request, res: Response) =>
    logout(req as AuthRequest, res)) as express.RequestHandler
);

/**
 * @route   GET /api/auth/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get(
  "/stats",
  authenticateToken as express.RequestHandler,
  ((req: Request, res: Response) =>
    getUserStats(req as AuthRequest, res)) as express.RequestHandler
);

export default router;
