import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { Phone, MessageCircle, Mail, ChevronRight, Clock, Home, Users, TrendingUp } from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'NEW',         label: 'جديد',         color: 'bg-gray-100 text-gray-700',    border: 'border-gray-300' },
  { key: 'CONTACTED',   label: 'تم التواصل',    color: 'bg-blue-100 text-blue-700',    border: 'border-blue-300' },
  { key: 'QUALIFIED',   label: 'مؤهل',          color: 'bg-purple-100 text-purple-700', border: 'border-purple-300' },
  { key: 'VIEWING',     label: 'معاينة',        color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-300' },
  { key: 'NEGOTIATION', label: 'تفاوض',         color: 'bg-orange-100 text-orange-700', border: 'border-orange-300' },
  { key: 'CONVERTED',   label: 'تم البيع',      color: 'bg-green-100 text-green-700',  border: 'border-green-300' },
];

const SOURCE_LABELS: Record<string, string> = {
  PROPERTY_PAGE: 'صفحة العقار',
  SEARCH: 'البحث',
  AI_SEARCH: 'البحث الذكي',
  WHATSAPP: 'واتساب',
  PHONE: 'هاتف',
};

function LeadCard({ lead, onSelect, onStatusChange }: any) {
  const firstProperty = lead.propertyInterests?.[0]?.property;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.phone) {
      window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=مرحباً ${lead.name}، أتواصل معك بخصوص العقار الذي أبديت اهتمامك به.`, '_blank');
    }
  };

  return (
    <div
      onClick={() => onSelect(lead)}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-800 text-sm">{lead.name}</h3>
        <span className="text-xs text-gray-400 font-en">{new Date(lead.createdAt).toLocaleDateString('ar-EG')}</span>
      </div>

      {firstProperty && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Home size={12} />
          <span className="truncate">{firstProperty.title}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {SOURCE_LABELS[lead.source] || lead.source}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {lead.phone && (
            <>
              <button onClick={handleWhatsApp} className="text-green-600 hover:text-green-700" title="واتساب">
                <MessageCircle size={15} />
              </button>
              <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:text-blue-700" title="اتصال">
                <Phone size={15} />
              </a>
            </>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="text-gray-600 hover:text-gray-700" title="إيميل">
              <Mail size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadDetailPanel({ lead, onClose, onStatusChange, onAddNote, onLogActivity }: any) {
  const [note, setNote] = useState('');
  const [activityType, setActivityType] = useState('CALL');

  if (!lead) return null;

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote(lead.id, note);
      setNote('');
    }
  };

  const handleLogActivity = () => {
    onLogActivity(lead.id, activityType);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[480px] bg-white h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-l from-primary to-navy p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{lead.name}</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">&times;</button>
          </div>
          <div className="flex gap-3">
            {lead.phone && (
              <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-600">
                <MessageCircle size={16} /> واتساب
              </a>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/30">
                <Phone size={16} /> اتصال
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/30">
                <Mail size={16} /> إيميل
              </a>
            )}
          </div>
        </div>

        <div className="p-6 flex-1 space-y-6">
          {/* Status Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">تغيير الحالة</label>
            <div className="grid grid-cols-3 gap-2">
              {PIPELINE_STAGES.map(stage => (
                <button
                  key={stage.key}
                  onClick={() => onStatusChange(lead.id, stage.key)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${lead.status === stage.key ? stage.color + ' ' + stage.border : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400'}`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Interests */}
          {lead.propertyInterests?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">العقارات المهتم بها</h3>
              <div className="space-y-2">
                {lead.propertyInterests.map((pi: any) => (
                  <div key={pi.id} className="bg-gray-50 rounded-lg p-3 text-sm flex items-center gap-2">
                    <Home size={14} className="text-primary" />
                    <span>{pi.property?.title || pi.propertyId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log Activity */}
          <div>
            <h3 className="font-bold text-gray-700 mb-2 text-sm">تسجيل تواصل</h3>
            <div className="flex gap-2">
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1">
                <option value="CALL">📞 مكالمة</option>
                <option value="WHATSAPP">💬 واتساب</option>
                <option value="EMAIL">✉️ إيميل</option>
                <option value="NOTE">📝 ملاحظة</option>
              </select>
              <button onClick={handleLogActivity}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90">
                تسجيل
              </button>
            </div>
          </div>

          {/* Add Note */}
          <div>
            <h3 className="font-bold text-gray-700 mb-2 text-sm">إضافة ملاحظة</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none"
              rows={3}
              placeholder="اكتب ملاحظتك هنا..."
            />
            <button onClick={handleAddNote}
              className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700 w-full">
              إضافة الملاحظة
            </button>
          </div>

          {/* Activity Timeline */}
          {lead.activities?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-sm">سجل الأنشطة</h3>
              <div className="space-y-3 border-r-2 border-gray-200 pr-4">
                {lead.activities.map((act: any) => (
                  <div key={act.id} className="relative">
                    <div className="w-3 h-3 bg-primary rounded-full absolute -right-[21px] top-1" />
                    <p className="text-xs text-gray-500 font-en">{new Date(act.createdAt).toLocaleString('ar-EG')}</p>
                    <p className="text-sm text-gray-700 font-bold">{act.type}</p>
                    {act.notes && <p className="text-xs text-gray-500">{act.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-sm">الملاحظات</h3>
              <div className="space-y-2">
                {lead.notes.map((n: any) => (
                  <div key={n.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{n.content}</p>
                    <p className="text-xs text-gray-400 mt-1 font-en">{new Date(n.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const LeadPipeline = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['agentLeads'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
    enabled: !!token
  });

  const { data: analytics } = useQuery({
    queryKey: ['leadAnalytics'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/leads/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: !!token
  });

  const { data: selectedLeadDetail } = useQuery({
    queryKey: ['leadDetail', selectedLead?.id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3333/leads/${selectedLead.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch lead');
      return res.json();
    },
    enabled: !!selectedLead?.id
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: any) => {
      const res = await fetch(`http://localhost:3333/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentLeads'] });
      queryClient.invalidateQueries({ queryKey: ['leadDetail', selectedLead?.id] });
    }
  });

  const noteMutation = useMutation({
    mutationFn: async ({ id, content }: any) => {
      const res = await fetch(`http://localhost:3333/leads/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content })
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leadDetail', selectedLead?.id] })
  });

  const activityMutation = useMutation({
    mutationFn: async ({ id, type }: any) => {
      const res = await fetch(`http://localhost:3333/leads/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type })
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leadDetail', selectedLead?.id] })
  });

  const getLeadsForStage = (status: string) =>
    leads.filter((l: any) => l.status === status);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Analytics header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={24} className="text-primary" /> خط سير العملاء
          </h1>
        </div>
        {analytics && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold font-en text-gray-800">{analytics.total}</p>
              <p className="text-xs text-gray-500">إجمالي العملاء</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold font-en text-blue-600">{analytics.viewing}</p>
              <p className="text-xs text-gray-500">في مرحلة المعاينة</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold font-en text-green-600">{analytics.converted}</p>
              <p className="text-xs text-gray-500">تم البيع</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold font-en text-primary">{analytics.conversionRate}%</p>
              <p className="text-xs text-gray-500">نسبة التحويل</p>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">جاري التحميل...</div>
      ) : (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = getLeadsForStage(stage.key);
              return (
                <div key={stage.key} className="w-64 flex flex-col">
                  <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${stage.color} border ${stage.border} border-b-0`}>
                    <span className="font-bold text-sm">{stage.label}</span>
                    <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full font-en">{stageLeads.length}</span>
                  </div>
                  <div className={`flex-1 border ${stage.border} border-t-0 rounded-b-xl p-3 space-y-3 bg-white/50 overflow-y-auto max-h-[calc(100vh-280px)]`}>
                    {stageLeads.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">لا يوجد عملاء</p>
                    ) : (
                      stageLeads.map((lead: any) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onSelect={setSelectedLead}
                          onStatusChange={(id: string, status: string) => statusMutation.mutate({ id, status })}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lead Detail Panel */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLeadDetail || selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={(id: string, status: string) => statusMutation.mutate({ id, status })}
          onAddNote={(id: string, content: string) => noteMutation.mutate({ id, content })}
          onLogActivity={(id: string, type: string) => activityMutation.mutate({ id, type })}
        />
      )}
    </div>
  );
};
