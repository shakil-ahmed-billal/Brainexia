import OpenAI from "openai";
import { prisma } from "../../config/database";
import { MessageChannel, MessageStatus } from "../../../generated/prisma/client";
import { env } from "../../config/env";

export interface GenerateMessageData {
  leadId: string;
  channel: MessageChannel;
  tone?: string;
  mode?: string;
  userId: string;
}

export class AiService {
  private openai: OpenAI | null = null;

  constructor() {
    if (env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
    }
  }

  private buildPrompt(lead: any, channel: MessageChannel, tone: string, mode: string): string {
    const toneDescription = {
      professional: "professional and business-like",
      friendly: "warm and friendly",
      casual: "casual and conversational",
      confident: "confident and assertive",
      "soft sales": "gentle and persuasive without being pushy",
    }[tone] || "professional";

    const modeDescription = {
      cold_outreach: "first-time contact to introduce your services",
      warm_followup: "follow-up message to re-engage the client",
      conversion_push: "message to encourage conversion with an offer or urgency",
      reminder: "reminder message for clients who haven't responded",
      friendly_checkin: "soft, human check-in message",
    }[mode] || "professional outreach";

    return `Write a ${toneDescription} ${channel.toLowerCase()} message for business outreach.

Client Information:
- Name: ${lead.clientName}
- Service Type: ${lead.serviceType}
- Website: ${lead.website || "Not provided"}
- Previous Contact Count: ${lead.approachCount} times
- Current Status: ${lead.serviceStatus}

Context: This is a ${modeDescription}.

Requirements:
- Keep it human-like and non-spammy
- Personalize based on the client's information
- Don't use hard sales tactics
- Keep it concise (${channel === "WHATSAPP" ? "short" : "medium length"})
- Start with a friendly greeting
- Mention their service interest naturally
- End with a clear but soft call-to-action

Generate the message now:`;
  }

  async generateMessage(data: GenerateMessageData) {
    const { leadId, channel, tone = "friendly", mode = "cold_outreach", userId } = data;

    // Get lead data
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    // Build prompt
    const prompt = this.buildPrompt(lead, channel, tone, mode);

    // Generate message with AI
    let aiResponse = "";
    if (this.openai) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional business communication assistant. Write personalized, human-like messages for client outreach.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: channel === "WHATSAPP" ? 200 : 500,
        });

        aiResponse = completion.choices[0]?.message?.content || "";
      } catch (error) {
        console.error("OpenAI API error:", error);
        // Fallback to template-based message
        aiResponse = this.generateFallbackMessage(lead, channel, tone, mode);
      }
    } else {
      // Fallback if OpenAI is not configured
      aiResponse = this.generateFallbackMessage(lead, channel, tone, mode);
    }

    // Save AI message
    const aiMessage = await prisma.aiMessage.create({
      data: {
        leadId,
        channel,
        aiPrompt: prompt,
        aiResponse,
        tone,
        mode,
        status: MessageStatus.PENDING,
      },
    });

    return aiMessage;
  }

  private generateFallbackMessage(lead: any, channel: MessageChannel, tone: string, mode: string): string {
    const greeting = `Hi ${lead.clientName},`;
    const serviceLine = `Hope you are doing well. We noticed you are interested in ${lead.serviceType} services.`;
    const offerLine = "We would love to help you grow your business.";
    const closing = "Best Regards,\nYour Team";

    if (channel === "WHATSAPP") {
      return `${greeting}\n\n${serviceLine}\n\n${offerLine}\n\nFeel free to reach out if you have any questions!`;
    }

    return `${greeting}\n\n${serviceLine}\n\n${offerLine}\n\n${closing}`;
  }

  async bulkGenerateMessages(
    leadIds: string[],
    channel: MessageChannel,
    tone: string,
    mode: string,
    userId: string
  ) {
    const results = [];

    for (const leadId of leadIds) {
      try {
        const result = await this.generateMessage({
          leadId,
          channel,
          tone,
          mode,
          userId,
        });
        results.push({ leadId, success: true, data: result });
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

  async updateFinalMessage(aiMessageId: string, finalMessage: string, userId: string) {
    const aiMessage = await prisma.aiMessage.findUnique({
      where: { id: aiMessageId },
      include: { lead: true },
    });

    if (!aiMessage || aiMessage.lead.userId !== userId) {
      throw new Error("AI message not found");
    }

    return await prisma.aiMessage.update({
      where: { id: aiMessageId },
      data: { finalMessage },
    });
  }

  async sendAiMessage(aiMessageId: string, userId: string) {
    const aiMessage = await prisma.aiMessage.findUnique({
      where: { id: aiMessageId },
      include: { lead: true },
    });

    if (!aiMessage || aiMessage.lead.userId !== userId) {
      throw new Error("AI message not found");
    }

    const messageToSend = aiMessage.finalMessage || aiMessage.aiResponse;

    // Create message log and send
    // This would integrate with the message service
    // For now, we'll update the AI message status
    const updated = await prisma.aiMessage.update({
      where: { id: aiMessageId },
      data: { status: MessageStatus.SENT },
    });

    // Update lead flags
    if (aiMessage.channel === MessageChannel.EMAIL) {
      await prisma.lead.update({
        where: { id: aiMessage.leadId },
        data: { emailSent: true, approachCount: { increment: 1 } },
      });
    } else if (aiMessage.channel === MessageChannel.WHATSAPP) {
      await prisma.lead.update({
        where: { id: aiMessage.leadId },
        data: { whatsappSent: true, approachCount: { increment: 1 } },
      });
    }

    return updated;
  }
}
