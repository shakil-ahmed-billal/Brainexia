import { prisma } from "../../config/database";
import { MessageChannel } from "../../generated/prisma";

export interface CreateTemplateData {
  name: string;
  content: string;
  channel: MessageChannel;
  placeholders?: string[];
  leadId?: string;
  userId?: string;
}

export class TemplateService {
  async createTemplate(data: CreateTemplateData) {
    return await prisma.template.create({
      data,
    });
  }

  async getTemplates(userId?: string, leadId?: string) {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    // If no filters, get global templates (no userId and no leadId)
    if (!userId && !leadId) {
      where.userId = null;
      where.leadId = null;
    }

    return await prisma.template.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getTemplateById(templateId: string, userId?: string) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    // Check ownership if userId provided
    if (userId && template.userId && template.userId !== userId) {
      throw new Error("Template not found");
    }

    return template;
  }

  async updateTemplate(templateId: string, userId: string, data: Partial<CreateTemplateData>) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    // Check ownership
    if (template.userId && template.userId !== userId) {
      throw new Error("Template not found");
    }

    return await prisma.template.update({
      where: { id: templateId },
      data,
    });
  }

  async deleteTemplate(templateId: string, userId: string) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    // Check ownership
    if (template.userId && template.userId !== userId) {
      throw new Error("Template not found");
    }

    await prisma.template.delete({
      where: { id: templateId },
    });

    return { success: true };
  }

  replacePlaceholders(template: string, data: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, "g"), value || "");
    }
    return result;
  }
}
