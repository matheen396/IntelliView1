import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "./config/passport";

// Import routes
import apiRoutes from "./routes";

// Create Express app
const app: Application = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Important for cookies!
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); // Parse cookies

// Initialize Passport
app.use(passport.initialize());

// Request logging middleware (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `${req.method} ${req.path} - ${res.statusCode} [${duration}ms]`
      );
    });
    next();
  });
}

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "IntelliView API Server",
    version: "1.0.0",
    documentation: "/api/docs",
    health: "/health",
  });
});

// Mount API routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler - catch all undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: err.message,
      details: err.details || null,
    });
  }

  if (err.name === "UnauthorizedError" || err.status === 401) {
    return res.status(401).json({
      error: "Unauthorized",
      message: err.message || "Authentication required",
    });
  }

  if (err.name === "ForbiddenError" || err.status === 403) {
    return res.status(403).json({
      error: "Forbidden",
      message: err.message || "Access denied",
    });
  }

  // Prisma errors
  if (err.code?.startsWith("P")) {
    return res.status(400).json({
      error: "Database Error",
      message: "A database error occurred",
      code: err.code,
    });
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      error: "File Upload Error",
      message: err.message,
    });
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "An unexpected error occurred";

  res.status(statusCode).json({
    error: "Internal Server Error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

export default app;
