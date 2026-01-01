import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth";

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

/**
 * Middleware to verify JWT tokens from Authorization header
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = user;
  next();
}
