import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(agentId: string) {
    const [
      totalProperties,
      publishedProperties,
      pendingProperties,
      draftProperties,
      leads,
      viewings
    ] = await Promise.all([
      this.prisma.property.count({ where: { ownerId: agentId } }),
      this.prisma.property.count({ where: { ownerId: agentId, status: 'PUBLISHED' } }),
      this.prisma.property.count({ where: { ownerId: agentId, status: 'PENDING_REVIEW' } }),
      this.prisma.property.count({ where: { ownerId: agentId, status: 'DRAFT' } }),
      this.prisma.lead.count({ where: { propertyInterests: { some: { property: { ownerId: agentId } } } } }),
      this.prisma.viewing.count({ where: { agentId } }),
    ]);

    return {
      properties: {
        total: totalProperties,
        published: publishedProperties,
        pendingReview: pendingProperties,
        drafts: draftProperties,
      },
      leads,
      viewings,
    };
  }

  async getProperties(agentId: string) {
    return this.prisma.property.findMany({
      where: { ownerId: agentId },
      include: {
        propertyType: true,
        media: { where: { isCover: true } },
        _count: {
          select: { leadInterests: true, viewings: true, events: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
}
