import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { MessageSquare, Phone, Mail, Clock, Calendar, CheckCircle2, X } from 'lucide-react';

interface UnifiedTimelineProps {
  leadId: string;
  onClose: () => void;
}

export const UnifiedTimeline: React.FC<UnifiedTimelineProps> = ({ leadId, onClose }) => {
  const { token } = useAuth();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['leadTimeline', leadId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3333/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch lead timeline');
      return res.json();
    },
    enabled: !!token && !!leadId,
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'WHATSAPP':
        return <span className="p-2 bg-green-100 text-green-600 rounded-full">💬</span>;
      case 'CALL':
        return <span className="p-2 bg-blue-100 text-blue-600 rounded-full">📞</span>;
      case 'EMAIL':
        return <span className="p-2 bg-purple-100 text-purple-600 rounded-full">✉️</span>;
      case 'VIEWING_SCHEDULED':
      case 'BOOK_VIEWING':
        return <span className="p-2 bg-amber-100 text-amber-600 rounded-full">📅</span>;
      default:
        return <span className="p-2 bg-gray-100 text-gray-600 rounded-full">📝</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Drawer Header */}
        <div className="bg-gradient-to-l from-primary to-navy p-5 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">{lead?.name || 'تفاصيل العميل'}</h3>
            <p className="text-xs text-gray-200">سجل التفاعل الزمني الموحد (Unified Timeline)</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-bold">
            &times;
          </button>
        </div>

        {/* Drawer Body */}
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">جاري تحميل السجل الزمني...</div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Lead Header Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">النية الاستثمارية:</span>
                <span className="text-xs bg-primary text-white font-bold px-2.5 py-0.5 rounded-full">
                  {lead?.intent || 'شراء'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">معدل التحويل المتوقع:</span>
                <span className="font-bold font-en text-emerald-600">%{Math.round((lead?.conversionProbability || 0.8) * 100)}</span>
              </div>
            </div>

            {/* Inquiries Section */}
            {lead?.inquiries?.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-gray-800 mb-3">طلبات الاستفسار ({lead.inquiries.length})</h4>
                <div className="space-y-2">
                  {lead.inquiries.map((inq: any) => (
                    <div key={inq.id} className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-amber-900">
                        <span>نوع الطلب: {inq.inquiryType}</span>
                        <span className="font-en text-[10px] text-gray-400">{new Date(inq.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      {inq.message && <p className="text-gray-600">{inq.message}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities Timeline */}
            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-4">الخط الزمني للتفاعلات (Timeline)</h4>
              <div className="relative border-r-2 border-gray-200 pr-6 space-y-6">
                {lead?.activities?.map((act: any) => (
                  <div key={act.id} className="relative flex items-start gap-3">
                    <div className="absolute -right-[35px] top-0">{getChannelIcon(act.type)}</div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-en block mb-0.5">
                        {new Date(act.createdAt).toLocaleString('ar-EG')}
                      </span>
                      <h5 className="font-bold text-xs text-gray-800">{act.type}</h5>
                      {act.notes && <p className="text-xs text-gray-500 mt-1">{act.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
