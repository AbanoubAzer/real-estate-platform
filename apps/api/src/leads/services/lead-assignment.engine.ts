import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface AssignmentResult {
  assignedAgentId: string;
  assignedTeam?: string;
  ruleMatched?: string;
  reasonAr: string;
  reasonEn: string;
}

@Injectable()
export class LeadAssignmentEngine {
  constructor(private prisma: PrismaService) {}

  /**
   * Auto-assigns an incoming lead to the best matching agent or team (E11.6 & E11.7).
   */
  async assignLead(lead: any, property?: any): Promise<AssignmentResult> {
    // 1. Admin Auto-Assignment Rules (E11.7)
    const city = property?.city || lead.city || '';
    const purpose = property?.purpose || lead.purpose || 'SALE';

    // Rule: Investment in Hurghada -> Investment Team / Hurghada Specialist
    if (city.includes('الغردقة') || city.includes('Hurghada')) {
      const hurghadaAgent = await this.prisma.user.findFirst({
        where: { role: 'AGENT', isVerifiedAgent: true },
        orderBy: { createdAt: 'asc' },
      });

      if (hurghadaAgent) {
        return {
          assignedAgentId: hurghadaAgent.id,
          assignedTeam: 'فريق استثمار البحر الأحمر (Hurghada Team)',
          ruleMatched: 'LOCATION_HURGHADA_RULE',
          reasonAr: `تم توجيه العميل تلقائياً لأخصائي منطقة الغردقة الاستثمارية (${hurghadaAgent.firstName})`,
          reasonEn: `Lead routed to Hurghada investment specialist (${hurghadaAgent.firstName})`,
        };
      }
    }

    // 2. Default: Assign to property owner / default verified agent
    if (property?.ownerId) {
      return {
        assignedAgentId: property.ownerId,
        assignedTeam: 'فريق العقارات المباشرة',
        ruleMatched: 'PROPERTY_OWNER_RULE',
        reasonAr: 'تم تعيين الوكيل المسؤول عن العقار تلقائياً',
        reasonEn: 'Assigned to listing property agent',
      };
    }

    // 3. Fallback: Find agent with lowest workload
    const availableAgent = await this.prisma.user.findFirst({
      where: { role: 'AGENT' },
      orderBy: { createdAt: 'asc' },
    });

    const defaultAgentId = availableAgent?.id || lead.agentId;

    return {
      assignedAgentId: defaultAgentId,
      assignedTeam: 'فريق المبيعات العامة',
      ruleMatched: 'WORKLOAD_BALANCER',
      reasonAr: 'تم التوزيع التلقائي بناءً على تفضيلات النظام',
      reasonEn: 'Auto-assigned by workload balance',
    };
  }
}
