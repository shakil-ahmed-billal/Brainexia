import { Router } from "express";
import { LeadController } from "./lead.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router: Router = Router();
const leadController = new LeadController();

router.use(authenticate);

router.post("/", (req, res, next) => leadController.createLead(req, res, next));
router.get("/", (req, res, next) => leadController.getLeads(req, res, next));
router.get("/:id", (req, res, next) => leadController.getLeadById(req, res, next));
router.put("/:id", (req, res, next) => leadController.updateLead(req, res, next));
router.delete("/:id", (req, res, next) => leadController.deleteLead(req, res, next));
router.patch("/bulk/status", (req, res, next) => leadController.bulkUpdateStatus(req, res, next));

export default router;
