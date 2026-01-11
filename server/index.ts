import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { authRouter } from "./routes/auth";
import { papersRouter } from "./routes/papers";
import { performanceRouter } from "./routes/performance";
import { gamificationRouter } from "./routes/gamification";
import { aiQuestionsRouter } from "./routes/ai-questions";
import { notificationsRouter } from "./routes/notifications";
import { initializeDatabase } from "./db";

// Track if database has been initialized (for serverless environments)
let dbInitialized = false;
let dbInitializationPromise: Promise<void> | null = null;

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database once (guard for serverless)
  if (!dbInitialized && !dbInitializationPromise) {
    dbInitializationPromise = initializeDatabase()
      .then(() => {
        dbInitialized = true;
        console.log("✓ Database initialized successfully");
      })
      .catch((err) => {
        console.error("Failed to initialize database:", err);
        // Don't call process.exit() in serverless - just log and continue
        // API routes will handle the database error gracefully
      });
  }

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.use("/api/auth", authRouter);

  // Papers and exam data routes
  app.use("/api/papers", papersRouter);

  // Performance and analytics routes
  app.use("/api/performance", performanceRouter);

  // Gamification routes
  app.use("/api/gamification", gamificationRouter);

  // AI Questions routes
  app.use("/api/ai", aiQuestionsRouter);

  // Notifications routes
  app.use("/api/notifications", notificationsRouter);

  return app;
}
