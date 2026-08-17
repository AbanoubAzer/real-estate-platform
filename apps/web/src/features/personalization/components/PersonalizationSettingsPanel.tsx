import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { Settings, ToggleLeft, ToggleRight, Trash2, Eye, Shield, AlertTriangle } from 'lucide-react';

export const PersonalizationSettingsPanel: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: pref } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/me/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!token,
  });

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await fetch('http://localhost:3333/me/personalization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userPreferences'] }),
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      await fetch('http://localhost:3333/me/personalization/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      queryClient.invalidateQueries({ queryKey: ['personalizedFeed'] });
      queryClient.invalidateQueries({ queryKey: ['recentlyViewed'] });
    },
  });

  const isEnabled = pref?.personalizationEnabled !== false;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-right space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={18} className="text-primary" />
        <h3 className="font-bold text-gray-800">إعدادات التخصيص والخصوصية (E11.16 & E11.28)</h3>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <Shield size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">التوصيات مخصصة بناءً على نشاطك</p>
          <p className="text-blue-700">يتم تخصيص التوصيات بناءً على عمليات البحث والمشاهدة والمفضلات. يمكنك التحكم أو إيقاف هذه الميزة في أي وقت.</p>
        </div>
      </div>

      {/* Toggle Personalization */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
        <button
          onClick={() => toggleMutation.mutate(!isEnabled)}
          className="transition-all"
        >
          {isEnabled
            ? <ToggleRight size={32} className="text-primary" />
            : <ToggleLeft size={32} className="text-gray-300" />
          }
        </button>
        <div>
          <h4 className="font-bold text-sm text-gray-800">تخصيص التوصيات</h4>
          <p className="text-xs text-gray-400">{isEnabled ? 'مفعّل — التوصيات مخصصة لك' : 'معطّل — التوصيات عامة'}</p>
        </div>
      </div>

      {/* Implicit Weights Preview */}
      {pref?.implicitWeights && Object.keys(pref.implicitWeights).length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <Eye size={14} /> ما تعلمه النظام عنك
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(pref.implicitWeights as Record<string, number>)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .slice(0, 10)
              .map(([key, value]) => (
                <span key={key} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
                  {key} <span className="font-en text-[10px] text-primary/60">%{Math.round((value as number) * 100)}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => {
            if (window.confirm('هل أنت متأكد من مسح جميع تفضيلاتك والنشاط السابق؟ لا يمكن التراجع.')) {
              resetMutation.mutate();
            }
          }}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm transition-colors"
        >
          <Trash2 size={16} />
          مسح جميع التفضيلات والنشاط
        </button>
        <p className="text-[11px] text-gray-400 mt-1">سيتم مسح: المفضلات، البحث المحفوظ، العقارات المشاهدة، والتفضيلات المكتسبة.</p>
      </div>
    </div>
  );
};
