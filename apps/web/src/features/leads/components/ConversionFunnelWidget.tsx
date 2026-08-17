import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { PieChart, TrendingUp, Users, CheckCircle, ArrowDown } from 'lucide-react';

export const ConversionFunnelWidget: React.FC = () => {
  const { token } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['conversionFunnelAnalytics'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/leads/analytics/funnel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch funnel analytics');
      return res.json();
    },
    enabled: !!token,
  });

  if (isLoading) return <div className="p-6 bg-white rounded-2xl animate-pulse h-64" />;

  const funnel = analytics?.funnel || { total: 0, qualified: 0, viewingBooked: 0, sold: 0 };
  const rates = analytics?.rates || { leadToQualified: '0%', qualifiedToViewing: '0%', overallConversion: '0%' };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-right space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
            <PieChart size={18} className="text-accent" />
            <span>تحليلات تحويل العملاء (E11.19 Conversion Funnel)</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">معدلات التحويل ونسبة إغلاق الصفقة</h3>
        </div>
        <div className="bg-emerald-50 text-emerald-700 font-extrabold text-sm px-4 py-2 rounded-xl border border-emerald-200">
          نسبة البيع الإجمالية: {rates.overallConversion}
        </div>
      </div>

      {/* Visual Funnel Bars */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>إجمالي العملاء (Total Leads)</span>
            <span className="font-en">{funnel.total}</span>
          </div>
          <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full flex items-center justify-end px-3 text-[11px] font-bold text-white transition-all duration-1000" style={{ width: '100%' }}>
              100%
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>عملاء مؤهلون (Qualified Leads)</span>
            <span className="font-en">{funnel.qualified}</span>
          </div>
          <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full flex items-center justify-end px-3 text-[11px] font-bold text-white transition-all duration-1000" style={{ width: `${rates.leadToQualified}` }}>
              {rates.leadToQualified}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>معاينات محجوزة (Booked Viewings)</span>
            <span className="font-en">{funnel.viewingBooked + funnel.viewingCompleted}</span>
          </div>
          <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full flex items-center justify-end px-3 text-[11px] font-bold text-white transition-all duration-1000" style={{ width: `${rates.qualifiedToViewing}` }}>
              {rates.qualifiedToViewing}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>صفقات مكتملة (Closed Sales)</span>
            <span className="font-en">{funnel.sold}</span>
          </div>
          <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full flex items-center justify-end px-3 text-[11px] font-bold text-white transition-all duration-1000" style={{ width: `${rates.overallConversion}` }}>
              {rates.overallConversion}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
