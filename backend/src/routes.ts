import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import leadRoutes from "./modules/leads/lead.routes";
import messageRoutes from "./modules/messages/message.routes";
import aiRoutes from "./modules/ai/ai.routes";
import templateRoutes from "./modules/templates/template.routes";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/leads", leadRoutes);
router.use("/messages", messageRoutes);
router.use("/ai", aiRoutes);
router.use("/templates", templateRoutes);

export default router;
