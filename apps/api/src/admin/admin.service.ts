import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      users,
      agents,
      properties,
      pendingProperties,
      reports,
      pendingAgents
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({ where: { role: 'AGENT' } }),
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
      this.prisma.propertyReport.count({ where: { status: 'OPEN' } }),
      this.prisma.agentVerification.count({ where: { status: 'PENDING' } }),
    ]);

    return { users, agents, properties, pendingProperties, reports, pendingAgents };
  }

  async getPendingProperties() {
    return this.prisma.property.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: { owner: true, propertyType: true },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async verifyProperty(id: string, adminId: string, action: 'APPROVE' | 'REJECT' | 'CHANGES_REQUESTED', notes?: string, reason?: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');

    let newStatus = property.status;
    if (action === 'APPROVE') newStatus = 'PUBLISHED';
    else if (action === 'REJECT') newStatus = 'DRAFT'; // Or keep as REJECTED depending on business rules
    else if (action === 'CHANGES_REQUESTED') newStatus = 'DRAFT';

    // Transaction to update property and create verification record and audit log
    await this.prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id },
        data: { status: newStatus as any }
      });

      await tx.propertyVerification.upsert({
        where: { propertyId: id },
        update: {
          status: action,
          reviewerId: adminId,
          notes,
          reason,
          reviewedAt: new Date()
        },
        create: {
          propertyId: id,
          status: action,
          reviewerId: adminId,
          notes,
          reason,
          reviewedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: `PROPERTY_${action}`,
          entityType: 'PROPERTY',
          entityId: id,
          metadata: { notes, reason }
        }
      });
    });

    return { success: true, newStatus };
  }
}
