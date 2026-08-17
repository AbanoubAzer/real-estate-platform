import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { Flame, Clock, Phone, MessageCircle, Mail, AlertTriangle, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { AIFollowupModal } from './AIFollowupModal';
import { UnifiedTimeline } from './UnifiedTimeline';

export const LeadPriorityQueue: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showFollowupModal, setShowFollowupModal] = useState(false);

  const { data: queueData, isLoading } = useQuery({
    queryKey: ['leadPriorityQueue'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/leads/priority-queue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch priority queue');
      return res.json();
    },
    enabled: !!token,
  });

  const getScoreBadge = (category: string, score: number) => {
    switch (category) {
      case 'VERY_HOT':
        return <span className="bg-red-500 text-white font-extrabold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1 shadow-md shadow-red-500/20"><Flame size={12} className="animate-bounce" /> {score} 🔥 حار جداً</span>;
      case 'HOT':
        return <span className="bg-orange-500 text-white font-bold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1"><Flame size={12} /> {score} حار</span>;
      case 'WARM':
        return <span className="bg-amber-500 text-white font-bold px-2.5 py-0.5 rounded-full text-xs">{score} دافئ</span>;
      default:
        return <span className="bg-gray-400 text-white font-medium px-2.5 py-0.5 rounded-full text-xs">{score} بارد</span>;
    }
  };

  const getSLABadge = (category: string) => {
    if (category === 'VERY_HOT') {
      return <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded flex items-center gap-1"><Clock size={10} /> SLA: 5 دقائق</span>;
    }
    if (category === 'HOT') {
      return <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded flex items-center gap-1"><Clock size={10} /> SLA: 30 دقيقة</span>;
    }
    return <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded">SLA: 2 ساعة</span>;
  };

  const categories = [
    { key: 'veryHot', title: '🔥 العائلات والأولويات العاجلة (Very Hot)', list: queueData?.veryHot || [], color: 'bg-red-50 border-red-200' },
    { key: 'hot', title: '⚡ عملاء حارون (Hot)', list: queueData?.hot || [], color: 'bg-orange-50 border-orange-200' },
    { key: 'warm', title: '☀️ عملاء دافئون (Warm)', list: queueData?.warm || [], color: 'bg-amber-50 border-amber-200' },
    { key: 'cold', title: '❄️ عملاء تحت المتابعة (Cold)', list: queueData?.cold || [], color: 'bg-gray-50 border-gray-200' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6 text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
            <TrendingUp size={18} className="text-accent" />
            <span>قائمة الأولويات الذكية (E11.21 Priority Queue)</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">ترتيب متابعة العملاء حسب الأهمية</h2>
        </div>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-red-200">
            {queueData?.veryHot?.length || 0} عميل عاجل
          </span>
          <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1.5 rounded-xl border border-primary/20">
            {queueData?.allLeads?.length || 0} إجمالي العملاء
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">جاري تحميل قائمة الأولويات...</div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.key} className={`rounded-2xl border p-4 ${cat.color}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-sm">{cat.title}</h3>
                <span className="text-xs font-bold text-gray-500 font-en">{cat.list.length} عميل</span>
              </div>

              {cat.list.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">لا يوجد عملاء في هذه الفئة حالياً</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.list.map((lead: any) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{lead.name}</h4>
                          <span className="text-[11px] text-gray-400">{lead.phone || lead.email}</span>
                        </div>
                        {getScoreBadge(lead.scoreCategory, lead.score)}
                      </div>

                      {/* Intent & SLA indicators */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {getSLABadge(lead.scoreCategory)}
                        <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                          النية: {lead.intent || 'شراء'} (%{Math.round((lead.conversionProbability || 0.8) * 100)})
                        </span>
                      </div>

                      {/* Quick AI Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                          setShowFollowupModal(true);
                        }}
                        className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Sparkles size={13} />
                        اقترح رد الذكاء الاصطناعي
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Follow-up Suggestion Modal (E11.9) */}
      {showFollowupModal && selectedLead && (
        <AIFollowupModal
          lead={selectedLead}
          onClose={() => setShowFollowupModal(false)}
        />
      )}

      {/* Unified Timeline Drawer (E11.12) */}
      {selectedLead && !showFollowupModal && (
        <UnifiedTimeline
          leadId={selectedLead.id}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};
