import { Router } from "express";
import { AiController } from "./ai.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router: Router = Router();
const aiController = new AiController();

router.use(authenticate);

router.post("/generate", (req, res, next) => aiController.generateMessage(req, res, next));
router.post("/bulk-generate", (req, res, next) => aiController.bulkGenerateMessages(req, res, next));
router.put("/:id/final-message", (req, res, next) => aiController.updateFinalMessage(req, res, next));
router.post("/:id/send", (req, res, next) => aiController.sendAiMessage(req, res, next));

export default router;
