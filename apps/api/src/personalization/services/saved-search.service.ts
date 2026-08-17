import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SavedSearchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all saved searches for a user (E11.9)
   */
  async getSavedSearches(userId: string) {
    const searches = await this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Check for new matches for each search
    const withAlerts = await Promise.all(
      searches.map(async (search) => {
        const filters = search.filters as any;
        const newCount = await this.countMatchingProperties(filters, search.lastCheckedAt);
        return {
          ...search,
          newMatchCount: newCount,
          hasNewMatches: newCount > 0,
        };
      }),
    );

    return withAlerts;
  }

  /**
   * Save a new search (E11.9)
   */
  async saveSearch(userId: string, name: string, filters: any) {
    return this.prisma.savedSearch.create({
      data: {
        userId,
        name,
        filters,
        lastCheckedAt: new Date(),
      },
    });
  }

  /**
   * Delete a saved search
   */
  async deleteSearch(userId: string, searchId: string) {
    await this.prisma.savedSearch.deleteMany({
      where: { id: searchId, userId },
    });
    return { success: true };
  }

  /**
   * Mark a saved search as checked (reset alert badge)
   */
  async markAsChecked(searchId: string) {
    return this.prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        lastCheckedAt: new Date(),
        newMatchCount: 0,
      },
    });
  }

  /**
   * Count properties matching filters created after a certain date (E11.10)
   */
  private async countMatchingProperties(filters: any, sinceDate?: Date | null): Promise<number> {
    const where: any = { status: 'PUBLISHED' };

    if (sinceDate) {
      where.createdAt = { gt: sinceDate };
    }
    if (filters?.city) where.city = filters.city;
    if (filters?.bedrooms) where.bedrooms = { gte: filters.bedrooms };
    if (filters?.budgetMax) where.price = { lte: filters.budgetMax };
    if (filters?.purpose) where.purpose = filters.purpose;

    return this.prisma.property.count({ where });
  }
}
