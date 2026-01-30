import { prisma } from "../../config/database";
import {
  ServiceType,
  ServiceStatus,
} from "../../generated/prisma";

export interface CreateLeadData {
  clientName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  address?: string;
  serviceType: ServiceType;
  source?: string;
  notes?: string;
  userId: string;
}

export interface UpdateLeadData {
  clientName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  address?: string;
  serviceType?: ServiceType;
  source?: string;
  serviceStatus?: ServiceStatus;
  notes?: string;
}

export interface LeadFilters {
  serviceType?: ServiceType;
  emailSent?: boolean;
  whatsappSent?: boolean;
  serviceStatus?: ServiceStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export class LeadService {
  async createLead(data: CreateLeadData) {
    return await prisma.lead.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getLeads(userId: string, filters: LeadFilters = {}) {
    const {
      serviceType,
      emailSent,
      whatsappSent,
      serviceStatus,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (serviceType) {
      where.serviceType = serviceType;
    }

    if (emailSent !== undefined) {
      where.emailSent = emailSent;
    }

    if (whatsappSent !== undefined) {
      where.whatsappSent = whatsappSent;
    }

    if (serviceStatus) {
      where.serviceStatus = serviceStatus;
    }

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLeadById(leadId: string, userId: string) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
        },
        aiMessages: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    return lead;
  }

  async updateLead(leadId: string, userId: string, data: UpdateLeadData) {
    // Verify ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    return await prisma.lead.update({
      where: { id: leadId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteLead(leadId: string, userId: string) {
    // Verify ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    await prisma.lead.delete({
      where: { id: leadId },
    });

    return { success: true };
  }

  async bulkUpdateStatus(
    leadIds: string[],
    userId: string,
    data: { serviceStatus?: ServiceStatus; approachCount?: number }
  ) {
    return await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        userId,
      },
      data,
    });
  }

  async incrementApproachCount(leadId: string, userId: string) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    return await prisma.lead.update({
      where: { id: leadId },
      data: {
        approachCount: { increment: 1 },
      },
    });
  }
}
