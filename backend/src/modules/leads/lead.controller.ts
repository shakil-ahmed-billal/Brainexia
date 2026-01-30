import { Request, Response, NextFunction } from "express";
import { LeadService } from "./lead.service";
import { AppError } from "../../middlewares/error.middleware";
import { AuthRequest } from "../../middlewares/auth.middleware";

const leadService = new LeadService();

export class LeadController {
  async createLead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const lead = await leadService.createLead({
        ...req.body,
        userId,
      });

      res.status(201).json({
        success: true,
        data: lead,
        message: "Lead created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeads(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const filters = {
        serviceType: req.query.serviceType as any,
        emailSent: req.query.emailSent === "true" ? true : req.query.emailSent === "false" ? false : undefined,
        whatsappSent: req.query.whatsappSent === "true" ? true : req.query.whatsappSent === "false" ? false : undefined,
        serviceStatus: req.query.serviceStatus as any,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await leadService.getLeads(userId, filters);

      res.json({
        success: true,
        data: result.leads,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeadById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const lead = await leadService.getLeadById(req.params.id, userId);

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const lead = await leadService.updateLead(req.params.id, userId, req.body);

      res.json({
        success: true,
        data: lead,
        message: "Lead updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      await leadService.deleteLead(req.params.id, userId);

      res.json({
        success: true,
        message: "Lead deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const { leadIds, ...updateData } = req.body;

      if (!leadIds || !Array.isArray(leadIds)) {
        throw new AppError("leadIds array is required");
      }

      const result = await leadService.bulkUpdateStatus(leadIds, userId, updateData);

      res.json({
        success: true,
        data: result,
        message: "Leads updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
