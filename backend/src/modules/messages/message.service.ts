import { prisma } from "../../config/database";
import { MessageChannel, MessageStatus } from "../../../generated/prisma/client";

export interface SendMessageData {
  leadId: string;
  channel: MessageChannel;
  message: string;
  userId: string;
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

    // TODO: Actually send email/WhatsApp
    // For now, we'll simulate sending
    let sentStatus = MessageStatus.SENT;
    let sentAt = new Date();

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
}
