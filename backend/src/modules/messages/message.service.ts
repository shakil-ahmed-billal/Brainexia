import nodemailer from "nodemailer";
import { prisma } from "../../config/database";
import { MessageChannel, MessageStatus } from "../../../generated/prisma/client";
import { env } from "../../config/env";

export interface SendMessageData {
  leadId: string;
  channel: MessageChannel;
  message: string;
  userId: string;
}

function getEmailTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  const port = env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : 587;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number.isNaN(port) ? 587 : port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export class MessageService {
  async sendMessage(data: SendMessageData) {
    const { leadId, channel, message, userId } = data;

    // Verify lead ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    // Create message log
    const messageLog = await prisma.message.create({
      data: {
        leadId,
        channel,
        message,
        status: MessageStatus.PENDING,
      },
    });

    let sentStatus = MessageStatus.SENT;
    let sentAt = new Date();

    if (channel === MessageChannel.EMAIL) {
      if (!lead.email || !lead.email.trim()) {
        await prisma.message.update({
          where: { id: messageLog.id },
          data: { status: MessageStatus.FAILED },
        });
        throw new Error("Lead has no email address. Add an email to this lead to send.");
      }
      const transporter = getEmailTransporter();
      if (!transporter) {
        await prisma.message.update({
          where: { id: messageLog.id },
          data: { status: MessageStatus.FAILED },
        });
        throw new Error("Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env");
      }
      try {
        await transporter.sendMail({
          from: env.SMTP_USER!,
          to: lead.email.trim(),
          subject: `Message from ${env.SMTP_USER?.split("@")[0] || "Brainexia"}`,
          text: message,
          html: message.replace(/\n/g, "<br>"),
        });
      } catch (err) {
        await prisma.message.update({
          where: { id: messageLog.id },
          data: { status: MessageStatus.FAILED },
        });
        throw new Error(
          err instanceof Error ? err.message : "Failed to send email. Check SMTP settings and lead email."
        );
      }
    }
    // WhatsApp: not implemented (would need Twilio/WhatsApp API); we still mark as sent for now
    if (channel === MessageChannel.WHATSAPP) {
      // TODO: integrate WhatsApp API when available
    }

    // Update message status
    const updatedMessage = await prisma.message.update({
      where: { id: messageLog.id },
      data: {
        status: sentStatus,
        sentAt,
      },
    });

    // Update lead flags
    if (channel === MessageChannel.EMAIL) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { emailSent: true, approachCount: { increment: 1 } },
      });
    } else if (channel === MessageChannel.WHATSAPP) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { whatsappSent: true, approachCount: { increment: 1 } },
      });
    }

    return updatedMessage;
  }

  async bulkSendMessages(
    leadIds: string[],
    channel: MessageChannel,
    message: string,
    userId: string
  ) {
    const results = [];

    for (const leadId of leadIds) {
      try {
        const result = await this.sendMessage({
          leadId,
          channel,
          message,
          userId,
        });
        results.push({ leadId, success: true, message: result });
      } catch (error) {
        results.push({
          leadId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  async getMessageHistory(leadId: string, userId: string) {
    // Verify lead ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    return await prisma.message.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Build placeholder map from lead for template replacement */
  private leadToPlaceholders(lead: {
    clientName: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    website: string | null;
    address: string | null;
    serviceType: string;
    source: string | null;
    serviceStatus: string;
    approachCount: number;
  }): Record<string, string> {
    return {
      clientName: lead.clientName ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      whatsapp: lead.whatsapp ?? "",
      website: lead.website ?? "",
      address: lead.address ?? "",
      serviceType: lead.serviceType ?? "",
      source: lead.source ?? "",
      serviceStatus: lead.serviceStatus ?? "",
      approachCount: String(lead.approachCount ?? 0),
    };
  }

  private replacePlaceholders(template: string, data: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), value ?? "");
    }
    return result;
  }

  async bulkSendPersonalized(
    leadIds: string[],
    channel: MessageChannel,
    messageTemplate: string,
    userId: string
  ) {
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds }, userId },
    });

    const results = [];
    for (const lead of leads) {
      const placeholders = this.leadToPlaceholders(lead);
      const message = this.replacePlaceholders(messageTemplate, placeholders);
      try {
        const result = await this.sendMessage({
          leadId: lead.id,
          channel,
          message,
          userId,
        });
        results.push({ leadId: lead.id, success: true, message: result });
      } catch (error) {
        results.push({
          leadId: lead.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    return results;
  }
}
