import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { authRouter } from "./routes/auth";
import { papersRouter } from "./routes/papers";
import { performanceRouter } from "./routes/performance";
import { gamificationRouter } from "./routes/gamification";
import { aiQuestionsRouter } from "./routes/ai-questions";
import { initializeDatabase } from "./db";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database on startup
  initializeDatabase().catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

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

  return app;
}
