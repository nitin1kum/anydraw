import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

// Extend Express Request type to include userId
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function middleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(403).json({ message: "No token provided" });
    return;
  }

  // Expected format: "Bearer <token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
    if (!decoded || !decoded.userId) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized or expired token" });
  }
}
