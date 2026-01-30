import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { AppError } from "../../middlewares/error.middleware";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        throw new AppError("Name, email, and password are required");
      }

      const user = await authService.register({ name, email, password });

      res.status(201).json({
        success: true,
        data: user,
        message: "User registered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("Email and password are required");
      }

      const user = await authService.login({ email, password });

      // TODO: Generate JWT token or Better-Auth session
      // For now, return user data
      res.json({
        success: true,
        data: user,
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Get userId from authenticated session
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const user = await authService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
