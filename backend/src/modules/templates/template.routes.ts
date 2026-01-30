import { Router } from "express";
import { TemplateController } from "./template.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router: Router = Router();
const templateController = new TemplateController();

router.use(authenticate);

router.post("/", (req, res, next) => templateController.createTemplate(req, res, next));
router.get("/", (req, res, next) => templateController.getTemplates(req, res, next));
router.get("/:id", (req, res, next) => templateController.getTemplateById(req, res, next));
router.put("/:id", (req, res, next) => templateController.updateTemplate(req, res, next));
router.delete("/:id", (req, res, next) => templateController.deleteTemplate(req, res, next));
router.post("/render", (req, res, next) => templateController.renderTemplate(req, res, next));

export default router;
