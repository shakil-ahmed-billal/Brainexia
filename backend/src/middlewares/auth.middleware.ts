import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: { message: "No token provided" },
      });
    }

    const token = authHeader.substring(7);

    // TODO: Verify token with Better-Auth or JWT
    // For now, we'll use a simple approach: check if token exists
    // In production, integrate with Better-Auth session verification or JWT verification
    
    // Temporary: For development, accept any token and use first user
    // In production, implement proper token verification
    if (token === "dummy-token" || token.length > 0) {
      // Get the first user as a temporary solution
      // In production, decode JWT or verify Better-Auth session
      const user = await prisma.user.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (user) {
        req.userId = user.id;
        req.userRole = user.role;
        next();
        return;
      }
    }

    return res.status(401).json({
      success: false,
      error: { message: "Invalid or expired token" },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: "Authentication failed" },
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: { message: "Admin access required" },
    });
  }
  next();
};
