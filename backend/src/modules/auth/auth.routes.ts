import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authLimiter } from "../../middlewares/rateLimit.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

const router: Router = Router();
const authController = new AuthController();

router.post("/register", authLimiter, (req, res, next) =>
  authController.register(req, res, next)
);
router.post("/login", authLimiter, (req, res, next) =>
  authController.login(req, res, next)
);
router.get("/profile", authenticate, (req, res, next) =>
  authController.getProfile(req, res, next)
);

export default router;
