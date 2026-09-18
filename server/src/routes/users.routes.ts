import { Router, Request, Response } from "express";
import { prisma } from "../config/database";

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public (should be protected in production)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isValidated: true,
        createdAt: true,
        _count: {
          select: {
            interviews: true,
            resumes: true,
            experiences: true,
          },
        },
      },
      take: 50, // Limit to 50 users
    });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public (should be protected in production)
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
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

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public (should be protected in production)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, name, role } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        role: role || "STUDENT",
      },
    });

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create user",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
