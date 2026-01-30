import { Request, Response, NextFunction } from "express";
import { AiService } from "./ai.service";
import { AppError } from "../../middlewares/error.middleware";
import { AuthRequest } from "../../middlewares/auth.middleware";

const aiService = new AiService();

export class AiController {
  async generateMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const { leadId, channel, tone, mode } = req.body;

      if (!leadId || !channel) {
        throw new AppError("leadId and channel are required");
      }

      const result = await aiService.generateMessage({
        leadId,
        channel,
        tone,
        mode,
        userId,
      });

      res.json({
        success: true,
        data: result,
        message: "AI message generated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkGenerateMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const { leadIds, channel, tone, mode } = req.body;

      if (!leadIds || !Array.isArray(leadIds) || !channel) {
        throw new AppError("leadIds array and channel are required");
      }

      const results = await aiService.bulkGenerateMessages(
        leadIds,
        channel,
        tone || "friendly",
        mode || "cold_outreach",
        userId
      );

      res.json({
        success: true,
        data: results,
        message: "Bulk AI messages generated",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFinalMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const { finalMessage } = req.body;

      if (!finalMessage) {
        throw new AppError("finalMessage is required");
      }

      const result = await aiService.updateFinalMessage(
        req.params.id,
        finalMessage,
        userId
      );

      res.json({
        success: true,
        data: result,
        message: "Final message updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async sendAiMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("User not authenticated");
      }

      const result = await aiService.sendAiMessage(req.params.id, userId);

      res.json({
        success: true,
        data: result,
        message: "AI message sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
