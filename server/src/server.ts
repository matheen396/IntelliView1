import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import app from "./app";
import { prisma } from "./config/database";

const PORT = process.env.PORT || 8000;

function validateProductionConfiguration() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const required = [
    "DATABASE_URL",
    "JWT_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "OPENAI_API_KEY",
    "PINECONE_API_KEY",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }
}

// Test database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test query
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database query test passed");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.error("Please make sure:");
    console.error("  1. PostgreSQL is running (docker-compose up -d)");
    console.error("  2. DATABASE_URL in .env is correct");
    console.error(
      "  3. Database migrations are applied (npx prisma migrate dev)"
    );
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    validateProductionConfiguration();
    // Connect to database first
    await connectDatabase();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log("\n🚀 IntelliView Server Started Successfully!\n");
      console.log(`📍 Server running at: http://localhost:${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📍 Database: Connected`);
      console.log("\n✨ Ready to accept requests!\n");
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        console.log("✅ HTTP server closed");

        // Close database connection
        try {
          await prisma.$disconnect();
          console.log("✅ Database connection closed");
        } catch (error) {
          console.error("❌ Error closing database connection:", error);
        }

        console.log("👋 Graceful shutdown complete. Goodbye!");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("⚠️ Forceful shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the application
startServer();
