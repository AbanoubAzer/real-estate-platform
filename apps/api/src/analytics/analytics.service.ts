import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async initializeSession(sessionToken: string) {
    const session = await this.prisma.anonymousSession.findUnique({
      where: { sessionToken }
    });

    if (!session) {
      return this.prisma.anonymousSession.create({
        data: { sessionToken }
      });
    }

    return this.prisma.anonymousSession.update({
      where: { sessionToken },
      data: { lastSeenAt: new Date() }
    });
  }

  async trackEvent(sessionToken: string, eventType: string, propertyId?: string, metadata?: any) {
    // Ensure session exists
    const session = await this.initializeSession(sessionToken);

    return this.prisma.userEvent.create({
      data: {
        sessionId: session.id,
        eventType,
        propertyId,
        metadata: metadata || {}
      }
    });
  }

  async getRecentSearches(sessionToken: string) {
    const session = await this.prisma.anonymousSession.findUnique({
      where: { sessionToken }
    });
    if (!session) return [];

    const searches = await this.prisma.userEvent.findMany({
      where: {
        sessionId: session.id,
        eventType: 'SEARCH_PERFORMED'
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return searches.map(s => s.metadata);
  }

  async getLastViewedProperty(sessionToken: string) {
    const session = await this.prisma.anonymousSession.findUnique({
      where: { sessionToken }
    });
    if (!session) return null;

    const lastView = await this.prisma.userEvent.findFirst({
      where: {
        sessionId: session.id,
        eventType: 'PROPERTY_VIEWED',
        propertyId: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        session: false // Just need the event
      }
    });

    if (!lastView || !lastView.propertyId) return null;

    return this.prisma.property.findUnique({
      where: { id: lastView.propertyId },
      include: {
        media: { where: { isCover: true } }
      }
    });
  }
}
