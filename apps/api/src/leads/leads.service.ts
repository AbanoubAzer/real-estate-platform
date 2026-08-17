import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { LeadScoringEngine } from './services/lead-scoring.engine';
import { LeadIntentEngine } from './services/lead-intent.engine';
import { LeadAssignmentEngine } from './services/lead-assignment.engine';
import { AiFollowupAssistantService } from './services/ai-followup-assistant.service';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private leadScoringEngine: LeadScoringEngine,
    private leadIntentEngine: LeadIntentEngine,
    private leadAssignmentEngine: LeadAssignmentEngine,
    private aiFollowupAssistantService: AiFollowupAssistantService,
  ) {}

  /**
   * Smart Lead Creation & Upsert (E11.2 & E11.6)
   * Detects duplicate leads by phone/email, recalculates lead score, assigns agent, and logs inquiries.
   */
  async createOrUpdateLead(dto: {
    agentId?: string;
    userId?: string;
    name: string;
    email?: string;
    phone?: string;
    message?: string;
    source?: string;
    propertyId?: string;
    inquiryType?: string; // CALLBACK, WHATSAPP, PRICING, PAYMENT_PLAN, AVAILABILITY, BROCHURE, BOOK_VIEWING
    budgetMin?: number;
    budgetMax?: number;
  }) {
    let targetAgentId = dto.agentId;
    let property: any = null;

    if (dto.propertyId) {
      property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
      if (property && !targetAgentId) {
        targetAgentId = property.ownerId;
      }
    }

    // Fallback assignment engine if no agent ID
    if (!targetAgentId) {
      const assignment = await this.leadAssignmentEngine.assignLead(dto, property);
      targetAgentId = assignment.assignedAgentId;
    }

    // 1. Check for Existing Lead (Duplicate Detection E11.2 & E11.17)
    let lead: any = null;
    if (dto.phone || dto.email || dto.userId) {
      lead = await this.prisma.lead.findFirst({
        where: {
          agentId: targetAgentId,
          OR: [
            dto.phone ? { phone: dto.phone } : undefined,
            dto.email ? { email: dto.email } : undefined,
            dto.userId ? { userId: dto.userId } : undefined,
          ].filter(Boolean) as any,
        },
        include: { activities: true, inquiries: true, propertyInterests: true, viewings: true },
      });
    }

    if (lead) {
      // Upsert: Add property interest if provided
      if (dto.propertyId) {
        await this.prisma.leadPropertyInterest.upsert({
          where: { leadId_propertyId: { leadId: lead.id, propertyId: dto.propertyId } },
          update: {},
          create: { leadId: lead.id, propertyId: dto.propertyId },
        });
      }

      // Add Inquiry
      if (dto.inquiryType) {
        await this.prisma.leadInquiry.create({
          data: {
            leadId: lead.id,
            propertyId: dto.propertyId,
            inquiryType: dto.inquiryType,
            source: dto.source || 'PROPERTY_PAGE',
            message: dto.message,
          },
        });
      }

      // Log Activity
      await this.prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: dto.inquiryType || 'INQUIRY_ADDED',
          notes: `Inquiry: ${dto.inquiryType || 'General'} on property`,
        },
      });

      // Recalculate Score & Intent
      const updatedInquiries = await this.prisma.leadInquiry.findMany({ where: { leadId: lead.id } });
      const updatedActivities = await this.prisma.leadActivity.findMany({ where: { leadId: lead.id } });

      const scoreResult = this.leadScoringEngine.calculateScore(updatedActivities, updatedInquiries, lead.propertyInterests?.length || 1);
      const intentResult = this.leadIntentEngine.analyzeIntent(lead, updatedInquiries, updatedActivities);

      const updatedLead = await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          score: scoreResult.score,
          scoreCategory: scoreResult.category,
          intent: intentResult.intent,
          intentConfidence: intentResult.confidence,
          conversionProbability: intentResult.conversionProbability,
          message: dto.message || lead.message,
        },
        include: { propertyInterests: { include: { property: true } }, inquiries: true, activities: true },
      });

      return { lead: updatedLead, duplicate: true };
    }

    // 2. Create Brand New Lead
    const scoreResult = this.leadScoringEngine.calculateScore([], [], 1);

    const newLead = await this.prisma.lead.create({
      data: {
        agentId: targetAgentId,
        userId: dto.userId || null,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        source: dto.source || 'PROPERTY_PAGE',
        status: 'NEW',
        score: scoreResult.score,
        scoreCategory: scoreResult.category,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        propertyInterests: dto.propertyId ? { create: [{ propertyId: dto.propertyId }] } : undefined,
        inquiries: dto.inquiryType ? {
          create: [{
            propertyId: dto.propertyId,
            inquiryType: dto.inquiryType,
            source: dto.source || 'PROPERTY_PAGE',
            message: dto.message,
          }]
        } : undefined,
        activities: {
          create: [{
            type: 'LEAD_CREATED',
            notes: `Lead created via ${dto.source || 'PROPERTY_PAGE'}`,
          }]
        }
      },
      include: {
        propertyInterests: { include: { property: true } },
        inquiries: true,
        activities: true,
      }
    });

    return { lead: newLead, duplicate: false };
  }

  /** Agent Priority Queue sorted by Lead Score (E11.21) */
  async getPriorityQueue(agentId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { agentId, status: { not: 'LOST' } },
      include: {
        propertyInterests: {
          include: { property: { include: { media: { where: { isCover: true } } } } }
        },
        inquiries: true,
        _count: { select: { activities: true, viewings: true } }
      },
      orderBy: [
        { score: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return {
      veryHot: leads.filter(l => l.scoreCategory === 'VERY_HOT'),
      hot: leads.filter(l => l.scoreCategory === 'HOT'),
      warm: leads.filter(l => l.scoreCategory === 'WARM'),
      cold: leads.filter(l => l.scoreCategory === 'COLD'),
      allLeads: leads,
    };
  }

  /** Fetch all leads for an agent */
  async getAgentLeads(agentId: string, status?: string) {
    return this.prisma.lead.findMany({
      where: { agentId, ...(status ? { status } : {}) },
      include: {
        propertyInterests: {
          include: { property: { include: { media: { where: { isCover: true } } } } }
        },
        inquiries: true,
        _count: { select: { activities: true, viewings: true } }
      },
      orderBy: { score: 'desc' }
    });
  }

  /** Get full lead details (activities, notes, tasks, viewings, inquiries, timeline) */
  async getLeadById(id: string, agentId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        propertyInterests: { include: { property: true } },
        inquiries: { orderBy: { createdAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { dueDate: 'asc' } },
        viewings: { orderBy: { scheduledAt: 'asc' } },
      }
    });
    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.agentId !== agentId) throw new ForbiddenException();

    // AI Intent & Conversion Prediction
    const intentResult = this.leadIntentEngine.analyzeIntent(lead, lead.inquiries, lead.activities);
    const followupSuggestion = this.aiFollowupAssistantService.generateFollowupSuggestion(lead, lead.propertyInterests?.[0]?.property);

    return {
      ...lead,
      intentResult,
      followupSuggestion,
    };
  }

  /** Update lead status and log state change */
  async updateStatus(id: string, agentId: string, newStatus: string, lostReason?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead || lead.agentId !== agentId) throw new ForbiddenException();

    const [updated] = await this.prisma.$transaction([
      this.prisma.lead.update({
        where: { id },
        data: {
          status: newStatus,
          lostReason: newStatus === 'LOST' ? lostReason : null,
          lastContactedAt: new Date(),
        }
      }),
      this.prisma.leadActivity.create({
        data: {
          leadId: id,
          actorId: agentId,
          type: 'STATUS_CHANGE',
          metadata: { fromStatus: lead.status, toStatus: newStatus, lostReason }
        }
      })
    ]);
    return updated;
  }

  /** Add a note */
  async addNote(leadId: string, agentId: string, content: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.agentId !== agentId) throw new ForbiddenException();

    return this.prisma.leadNote.create({
      data: { leadId, authorId: agentId, content }
    });
  }

  /** Log a communication activity */
  async logActivity(leadId: string, agentId: string, type: string, notes?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.agentId !== agentId) throw new ForbiddenException();

    return this.prisma.leadActivity.create({
      data: { leadId, actorId: agentId, type, notes }
    });
  }

  /** E11.19: Conversion Analytics Funnel */
  async getConversionFunnel(agentId: string) {
    const [total, contacted, qualified, viewingBooked, viewingCompleted, negotiation, offer, reserved, sold, lost] = await Promise.all([
      this.prisma.lead.count({ where: { agentId } }),
      this.prisma.lead.count({ where: { agentId, status: 'CONTACTED' } }),
      this.prisma.lead.count({ where: { agentId, status: 'QUALIFIED' } }),
      this.prisma.lead.count({ where: { agentId, status: 'VIEWING_BOOKED' } }),
      this.prisma.lead.count({ where: { agentId, status: 'VIEWING_COMPLETED' } }),
      this.prisma.lead.count({ where: { agentId, status: 'NEGOTIATION' } }),
      this.prisma.lead.count({ where: { agentId, status: 'OFFER' } }),
      this.prisma.lead.count({ where: { agentId, status: 'RESERVED' } }),
      this.prisma.lead.count({ where: { agentId, status: 'SOLD' } }),
      this.prisma.lead.count({ where: { agentId, status: 'LOST' } }),
    ]);

    const leadToQualified = total > 0 ? ((qualified / total) * 100).toFixed(1) : '0.0';
    const qualifiedToViewing = qualified > 0 ? (((viewingBooked + viewingCompleted) / qualified) * 100).toFixed(1) : '0.0';
    const viewingToSale = (viewingBooked + viewingCompleted) > 0 ? ((sold / (viewingBooked + viewingCompleted)) * 100).toFixed(1) : '0.0';
    const overallConversion = total > 0 ? ((sold / total) * 100).toFixed(1) : '0.0';

    return {
      funnel: {
        total,
        contacted,
        qualified,
        viewingBooked,
        viewingCompleted,
        negotiation,
        offer,
        reserved,
        sold,
        lost,
      },
      rates: {
        leadToQualified: `${leadToQualified}%`,
        qualifiedToViewing: `${qualifiedToViewing}%`,
        viewingToSale: `${viewingToSale}%`,
        overallConversion: `${overallConversion}%`,
      }
    };
  }
}
