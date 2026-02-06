import { Request, Response, NextFunction } from "express";
import { MessageService } from "./message.service";
import { AppError } from "../../middlewares/error.middleware";
import { AuthRequest } from "../../middlewares/auth.middleware";

const messageService = new MessageService();

export class MessageController {
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const { leadId, channel, message } = req.body;

      if (!leadId || !channel || !message) {
        throw new AppError("leadId, channel, and message are required");
      }

      const result = await messageService.sendMessage({
        leadId,
        channel,
        message,
        userId,
      });

      res.json({
        success: true,
        data: result,
        message: "Message sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkSendMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const { leadIds, channel, message } = req.body;

      if (!leadIds || !Array.isArray(leadIds) || !channel || !message) {
        throw new AppError("leadIds array, channel, and message are required");
      }

      const results = await messageService.bulkSendMessages(
        leadIds,
        channel,
        message,
        userId
      );

      res.json({
        success: true,
        data: results,
        message: "Bulk messages processed",
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkSendPersonalized(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const { leadIds, channel, messageTemplate } = req.body;

      if (!leadIds || !Array.isArray(leadIds) || !channel || !messageTemplate) {
        throw new AppError("leadIds array, channel, and messageTemplate are required");
      }

      const results = await messageService.bulkSendPersonalized(
        leadIds,
        channel,
        messageTemplate,
        userId
      );

      res.json({
        success: true,
        data: results,
        message: "Bulk personalized messages processed",
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessageHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const messages = await messageService.getMessageHistory(
        req.params.leadId,
        userId
      );

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
}
