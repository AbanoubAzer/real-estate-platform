import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ViewingsService {
  constructor(private prisma: PrismaService) {}

  async scheduleViewing(dto: {
    leadId: string;
    propertyId: string;
    agentId: string;
    scheduledAt: Date;
    customerNotes?: string;
  }) {
    const { leadId, propertyId, agentId, scheduledAt, customerNotes } = dto;

    // Update lead status to VIEWING
    await this.prisma.lead.update({ where: { id: leadId }, data: { status: 'VIEWING' } });

    const viewing = await this.prisma.viewing.create({
      data: { leadId, propertyId, agentId, scheduledAt, customerNotes },
      include: { lead: true, property: true }
    });

    // Log activity
    await this.prisma.leadActivity.create({
      data: {
        leadId,
        actorId: agentId,
        type: 'VIEWING_SCHEDULED',
        notes: `Viewing scheduled for ${scheduledAt.toLocaleDateString()}`
      }
    });

    return viewing;
  }

  async updateStatus(id: string, agentId: string, status: string, agentNotes?: string) {
    const viewing = await this.prisma.viewing.findUnique({ where: { id } });
    if (!viewing) throw new NotFoundException();
    if (viewing.agentId !== agentId) throw new ForbiddenException();

    return this.prisma.viewing.update({
      where: { id },
      data: { status, agentNotes }
    });
  }

  async submitFeedback(id: string, dto: {
    feedbackRating: number;
    feedbackInterest: string;
    feedbackComment?: string;
  }) {
    const viewing = await this.prisma.viewing.update({
      where: { id },
      data: { ...dto, status: 'COMPLETED' }
    });

    // Update lead activity
    await this.prisma.leadActivity.create({
      data: {
        leadId: viewing.leadId,
        type: 'VIEWING_FEEDBACK',
        notes: `Rating: ${dto.feedbackRating}/5 — Interest: ${dto.feedbackInterest}`,
        metadata: dto
      }
    });

    return viewing;
  }

  async getAgentViewings(agentId: string) {
    return this.prisma.viewing.findMany({
      where: { agentId },
      include: {
        lead: true,
        property: { include: { media: { where: { isCover: true } } } }
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }
}
