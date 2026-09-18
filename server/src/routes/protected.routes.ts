import express from "express";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth";

const router = express.Router();

/**
 * @route   GET /api/protected/student
 * @desc    Student dashboard - accessible by STUDENT and ADMIN
 * @access  Private (STUDENT, ADMIN)
 */
router.get(
  "/student",
  authenticateToken,
  authorizeRoles("STUDENT", "ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "🎓 Welcome to Student Dashboard",
      user: req.user,
      features: [
        "Take mock interviews",
        "Upload resumes",
        "View interview history",
        "Practice with AI",
      ],
    });
  }
);

/**
 * @route   GET /api/protected/admin
 * @desc    Admin panel - accessible by ADMIN only
 * @access  Private (ADMIN)
 */
router.get(
  "/admin",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "👑 Welcome to Admin Panel",
      user: req.user,
      features: [
        "Manage all users",
        "View system analytics",
        "Configure AI settings",
        "Moderate content",
      ],
    });
  }
);

/**
 * @route   GET /api/protected/coordinator
 * @desc    Placement Coordinator dashboard
 * @access  Private (PLACEMENT_COORDINATOR, ADMIN)
 */
router.get(
  "/coordinator",
  authenticateToken,
  authorizeRoles("PLACEMENT_COORDINATOR", "ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "📊 Welcome to Coordinator Dashboard",
      user: req.user,
      features: [
        "View student progress",
        "Schedule interviews",
        "Generate reports",
        "Manage companies",
      ],
    });
  }
);

/**
 * @route   GET /api/protected/profile
 * @desc    User profile - accessible by all authenticated users
 * @access  Private
 */
router.get("/profile", authenticateToken, (req: AuthRequest, res) => {
  res.json({
    success: true,
    message: "User profile retrieved",
    user: req.user,
  });
});

export default router;
