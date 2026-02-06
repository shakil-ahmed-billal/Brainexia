import { Request, Response, NextFunction } from "express";
import { TemplateService } from "./template.service";
import { AppError } from "../../middlewares/error.middleware";
import { AuthRequest } from "../../middlewares/auth.middleware";

const templateService = new TemplateService();

export class TemplateController {
  async createTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const template = await templateService.createTemplate({
        ...req.body,
        userId,
      });

      res.status(201).json({
        success: true,
        data: template,
        message: "Template created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const leadId = req.query.leadId as string | undefined;

      const templates = await templateService.getTemplates(userId, leadId);

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTemplateById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const template = await templateService.getTemplateById(req.params.id as any, userId);

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const template = await templateService.updateTemplate(
        req.params.id as any,
        userId,
        req.body
      );

      res.json({
        success: true,
        data: template,
        message: "Template updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      await templateService.deleteTemplate(req.params.id as any, userId);

      res.json({
        success: true,
        message: "Template deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async renderTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { templateId, data } = req.body;

      if (!templateId || !data) {
        throw new AppError("templateId and data are required");
      }

      const userId = req.userId;
      const template = await templateService.getTemplateById(templateId, userId);

      const rendered = templateService.replacePlaceholders(template.content, data);

      res.json({
        success: true,
        data: { rendered },
      });
    } catch (error) {
      next(error);
    }
  }
}
