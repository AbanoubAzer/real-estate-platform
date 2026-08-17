import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto, ownerId: string) {
    const { features, media, paymentPlans, status, ...propertyData } = createPropertyDto;

    // Generate SEO-friendly slug
    const baseSlug = propertyData.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${uniqueId}`;

    return this.prisma.property.create({
      data: {
        ...propertyData,
        slug,
        ownerId,
        status: (status as any) || 'DRAFT', // Default to DRAFT
        features: {
          create: features?.map(id => ({ featureId: id })) || [],
        },
        media: {
          create: media?.map(m => ({
            type: m.type,
            url: m.url,
            thumbnailUrl: m.thumbnailUrl,
            sortOrder: m.sortOrder,
            isCover: m.isCover,
          })) || [],
        },
        paymentPlans: {
          create: paymentPlans?.map(p => ({
            name: p.name,
            paymentType: p.paymentType,
            totalPrice: p.totalPrice,
            downPayment: p.downPayment,
            installment: p.installment,
            frequency: p.frequency,
            durationMonths: p.durationMonths,
          })) || [],
        }
      },
      include: {
        media: true,
        features: { include: { feature: true } },
        paymentPlans: true,
      },
    });
  }

  async submitForReview(id: string, ownerId: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property || property.ownerId !== ownerId) throw new NotFoundException();
    
    // In a real app, calculate and save listingQuality score here
    
    return this.prisma.property.update({
      where: { id },
      data: { status: 'PENDING_REVIEW' }
    });
  }

  async publish(id: string) {
    // Usually Admin only
    return this.prisma.property.update({
      where: { id },
      data: { status: 'PUBLISHED' }
    });
  }

  async duplicate(id: string, ownerId: string) {
    const property = await this.prisma.property.findUnique({ 
      where: { id },
      include: { features: true, media: true, paymentPlans: true }
    });
    
    if (!property || property.ownerId !== ownerId) throw new NotFoundException();

    const uniqueId = Math.random().toString(36).substring(2, 8);
    
    return this.prisma.property.create({
      data: {
        ...property,
        id: undefined,
        slug: `${property.slug}-copy-${uniqueId}`,
        title: `${property.title} (Copy)`,
        status: 'DRAFT',
        createdAt: undefined,
        updatedAt: undefined,
        features: {
          create: property.features.map(f => ({ featureId: f.featureId }))
        },
        media: {
          create: property.media.map(m => ({
            type: m.type, url: m.url, thumbnailUrl: m.thumbnailUrl, sortOrder: m.sortOrder, isCover: m.isCover
          }))
        },
        paymentPlans: {
          create: property.paymentPlans.map(p => ({
            name: p.name, paymentType: p.paymentType, totalPrice: p.totalPrice, downPayment: p.downPayment,
            installment: p.installment, frequency: p.frequency, durationMonths: p.durationMonths
          }))
        }
      }
    });
  }

  async findAll(searchDto?: any) {
    const {
      q,
      purpose,
      propertyTypeId,
      city,
      areaLocation,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      features,
      furnished,
      sort,
      page = 1,
      limit = 20,
    } = searchDto || {};

    const where: any = {};

    // PSF-01: Keyword Search (Title, Description, City, Area)
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { areaLocation: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Exact matches
    if (purpose) where.purpose = purpose;
    if (propertyTypeId) where.propertyTypeId = propertyTypeId;
    if (city) where.city = { equals: city, mode: 'insensitive' };
    if (areaLocation) where.areaLocation = { equals: areaLocation, mode: 'insensitive' };
    if (furnished !== undefined) where.furnished = furnished;

    // Ranges (PSF-05, PSF-06, PSF-07, PSF-08)
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = Number(minArea);
      if (maxArea) where.area.lte = Number(maxArea);
    }

    if (bedrooms) where.bedrooms = { gte: Number(bedrooms) };
    if (bathrooms) where.bathrooms = { gte: Number(bathrooms) };

    // PSF-15: Features filtering (AND logic - must have ALL requested features)
    if (features && features.length > 0) {
      // For each feature, ensure there is a relation
      where.AND = features.map(f => ({
        features: {
          some: {
            feature: {
              name: f
            }
          }
        }
      }));
    }

    // PSF-12: Sorting
    let orderBy: any = { createdAt: 'desc' }; // Default newest
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'area_asc') orderBy = { area: 'asc' };
    if (sort === 'area_desc') orderBy = { area: 'desc' };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Advanced Filters (Epic 5)
    if (searchDto.paymentMethod) where.paymentMethod = searchDto.paymentMethod as any;
    if (searchDto.maxDownPayment) where.downPayment = { lte: Number(searchDto.maxDownPayment) };
    if (searchDto.maxMonthlyInstallment) where.monthlyInstallment = { lte: Number(searchDto.maxMonthlyInstallment) };
    if (searchDto.investmentType) where.investmentType = searchDto.investmentType as any;

    const [rawData, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          propertyType: true,
          media: { where: { status: 'ACTIVE' } },
          features: { include: { feature: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    // Calculate Match Score for each property
    const { calculateMatchScore } = require('../search/match-scoring.util');
    let data = rawData.map(prop => ({
      ...prop,
      matchScore: calculateMatchScore(prop, searchDto)
    }));

    // If sorting by match_score, sort it in memory (since it's computed)
    if (sort === 'match_score') {
      data.sort((a, b) => b.matchScore - a.matchScore);
    }

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOne(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    const property = await this.prisma.property.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        propertyType: true,
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        features: {
          include: { feature: true }
        },
        owner: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    if (!property) {
      throw new NotFoundException(`Property not found`);
    }

    return property;
  }

  // Epic 4: Favorites and Reporting
  async toggleFavorite(propertyId: string, userId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } }
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { status: 'removed' };
    } else {
      await this.prisma.favorite.create({
        data: { userId, propertyId }
      });
      return { status: 'added' };
    }
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: { media: { where: { isCover: true } } }
        }
      }
    });
  }

  async reportProperty(propertyId: string, userId: string, reason: string, details?: string) {
    return this.prisma.propertyReport.create({
      data: {
        propertyId,
        reporterId: userId,
        reason,
        description: details
      }
    });
  }

  // Epic 5: Saved Searches
  async saveSearch(userId: string, name: string, filters: any) {
    return this.prisma.savedSearch.create({
      data: {
        userId,
        name,
        filters,
      }
    });
  }

  async getSavedSearches(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // PD-13 Similar Properties
  async findSimilar(id: string) {
    const property = await this.findOne(id);
    
    // Simple heuristic: Same type, same city, exclude self
    return this.prisma.property.findMany({
      where: {
        id: { not: id },
        propertyTypeId: property.propertyTypeId,
        city: property.city,
        purpose: property.purpose,
      },
      take: 3,
      orderBy: {
        price: 'asc' // Simplistic nearest-price approach by just grabbing cheapest in area
      },
      include: {
        propertyType: true,
        media: { where: { status: 'ACTIVE' } },
      }
    });
  }

  // PD-14 Track Views
  async trackView(propertyId: string, sessionId: string, source?: string) {
    return this.prisma.propertyView.create({
      data: {
        propertyId,
        anonymousSessionId: sessionId,
        source: source || 'DIRECT',
      }
    });
  }

  // PD-09, PD-10 Create Lead — uses new E09 CRM architecture
  async createLead(propertyId: string, dto: any) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new Error('Property not found');

    const agentId = property.ownerId;

    // Duplicate detection: same phone → same agent
    if (dto.phone) {
      const existing = await this.prisma.lead.findFirst({
        where: { agentId, phone: dto.phone }
      });
      if (existing) {
        await this.prisma.leadPropertyInterest.upsert({
          where: { leadId_propertyId: { leadId: existing.id, propertyId } },
          update: {},
          create: { leadId: existing.id, propertyId }
        });
        return { lead: existing, duplicate: true };
      }
    }

    const lead = await this.prisma.lead.create({
      data: {
        agentId,
        userId: dto.userId || null,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        source: dto.source || 'PROPERTY_PAGE',
        propertyInterests: { create: [{ propertyId }] },
        activities: {
          create: [{
            type: 'LEAD_CREATED',
            notes: `Lead created via ${dto.source || 'PROPERTY_PAGE'}`
          }]
        }
      },
      include: { propertyInterests: true }
    });

    return { lead, duplicate: false };
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    // PM-02: Update property
    await this.findOne(id); // Ensure exists
    
    const data: any = { ...updatePropertyDto };

    return this.prisma.property.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    // PM-03: Delete or Hide Property
    await this.findOne(id);
    return this.prisma.property.delete({
      where: { id },
    });
  }

  // --- Media Management ---

  async addMedia(propertyId: string, data: any) {
    // If no cover exists, make the first one the cover
    const existingMedia = await this.prisma.propertyMedia.count({
      where: { propertyId },
    });
    
    return this.prisma.propertyMedia.create({
      data: {
        ...data,
        propertyId,
        isCover: existingMedia === 0 && data.type === 'IMAGE' ? true : false,
        sortOrder: existingMedia,
      },
    });
  }

  async reorderMedia(propertyId: string, order: { id: string; sortOrder: number }[]) {
    // Execute updates in a transaction
    const transactions = order.map((item) =>
      this.prisma.propertyMedia.update({
        where: { id: item.id, propertyId },
        data: { sortOrder: item.sortOrder },
      })
    );
    return this.prisma.$transaction(transactions);
  }

  async setCoverImage(propertyId: string, mediaId: string) {
    // Unset all existing covers for this property
    await this.prisma.propertyMedia.updateMany({
      where: { propertyId, isCover: true },
      data: { isCover: false },
    });

    // Set the new cover
    return this.prisma.propertyMedia.update({
      where: { id: mediaId, propertyId },
      data: { isCover: true },
    });
  }

  async removeMedia(propertyId: string, mediaId: string) {
    const media = await this.prisma.propertyMedia.findUnique({ where: { id: mediaId, propertyId } });
    if (!media) throw new NotFoundException('Media not found');
    
    await this.prisma.propertyMedia.delete({
      where: { id: mediaId },
    });
    
    // If it was the cover, promote the next image to cover
    if (media.isCover) {
      const nextMedia = await this.prisma.propertyMedia.findFirst({
        where: { propertyId, type: 'IMAGE' },
        orderBy: { sortOrder: 'asc' },
      });
      if (nextMedia) {
        await this.setCoverImage(propertyId, nextMedia.id);
      }
    }
    
    return media;
  }
}
