import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ComparisonService {
  constructor(private prisma: PrismaService) {}

  async createComparison(userId: string | null, propertyIds: string[]) {
    if (propertyIds.length > 4) {
      throw new BadRequestException('You can compare up to 4 properties.');
    }

    // Default weights
    const criteriaWeights = {
      price: 40,
      location: 20,
      space: 15,
      investment: 15,
      amenities: 10,
    };

    return this.prisma.comparison.create({
      data: {
        userId,
        propertyIds,
        criteriaWeights,
        shareToken: randomBytes(16).toString('hex'),
      },
    });
  }

  async getComparison(id: string) {
    const comparison = await this.prisma.comparison.findUnique({
      where: { id },
    });

    if (!comparison) {
      throw new NotFoundException('Comparison not found');
    }

    const properties = await this.prisma.property.findMany({
      where: {
        id: { in: comparison.propertyIds },
      },
      include: {
        media: { where: { isCover: true } },
        propertyType: true,
        features: true,
        paymentPlans: true,
      },
    });

    // Ensure they match the order
    const orderedProperties = comparison.propertyIds
      .map(id => properties.find(p => p.id === id))
      .filter(p => !!p);

    return {
      comparison,
      properties: orderedProperties,
    };
  }

  async getComparisonByShareToken(shareToken: string) {
    const comparison = await this.prisma.comparison.findUnique({
      where: { shareToken },
    });

    if (!comparison) {
      throw new NotFoundException('Comparison not found');
    }

    return this.getComparison(comparison.id);
  }

  async addProperty(id: string, propertyId: string) {
    const comparison = await this.prisma.comparison.findUnique({
      where: { id },
    });

    if (!comparison) throw new NotFoundException('Comparison not found');

    if (comparison.propertyIds.length >= 4) {
      throw new BadRequestException('You can compare up to 4 properties.');
    }

    if (comparison.propertyIds.includes(propertyId)) {
      return comparison; // Already exists
    }

    return this.prisma.comparison.update({
      where: { id },
      data: {
        propertyIds: {
          push: propertyId,
        },
      },
    });
  }

  async removeProperty(id: string, propertyId: string) {
    const comparison = await this.prisma.comparison.findUnique({
      where: { id },
    });

    if (!comparison) throw new NotFoundException('Comparison not found');

    const updatedIds = comparison.propertyIds.filter(pid => pid !== propertyId);

    return this.prisma.comparison.update({
      where: { id },
      data: {
        propertyIds: updatedIds,
      },
    });
  }

  async updateWeights(id: string, weights: any) {
    return this.prisma.comparison.update({
      where: { id },
      data: {
        criteriaWeights: weights,
      },
    });
  }

  async submitFeedback(comparisonId: string, userId: string | null, isHelpful: boolean, missingInfo: string[], comment?: string) {
    return this.prisma.comparisonFeedback.create({
      data: {
        comparisonId,
        userId,
        isHelpful,
        missingInfo,
        comment,
      },
    });
  }
}
