import { Router } from "express";
import { MessageController } from "./message.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router: Router = Router();
const messageController = new MessageController();

router.use(authenticate);

router.post("/send", (req, res, next) => messageController.sendMessage(req, res, next));
router.post("/bulk-send", (req, res, next) => messageController.bulkSendMessages(req, res, next));
router.get("/history/:leadId", (req, res, next) => messageController.getMessageHistory(req, res, next));

export default router;
