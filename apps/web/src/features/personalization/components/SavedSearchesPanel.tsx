import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { Bookmark, Bell, BellRing, Trash2, Play, Plus } from 'lucide-react';

export const SavedSearchesPanel: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');

  const { data: searches } = useQuery({
    queryKey: ['savedSearches'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/me/saved-searches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (searchId: string) => {
      await fetch(`http://localhost:3333/me/saved-searches/${searchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches'] }),
  });

  if (!searches || searches.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-right">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark size={18} className="text-primary" />
          <h3 className="font-bold text-gray-800">عمليات البحث المحفوظة</h3>
        </div>
        <p className="text-sm text-gray-400">لا توجد عمليات بحث محفوظة. احفظ بحثك للحصول على تنبيهات فورية!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-right space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-400 font-en">{searches.length} بحث</span>
        <div className="flex items-center gap-2">
          <Bookmark size={18} className="text-primary" />
          <h3 className="font-bold text-gray-800">عمليات البحث المحفوظة (E11.9)</h3>
        </div>
      </div>

      <div className="space-y-3">
        {searches.map((search: any) => {
          const filters = search.filters || {};
          return (
            <div key={search.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteMutation.mutate(search.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
                <a
                  href={`/search?${new URLSearchParams(filters).toString()}`}
                  className="text-primary hover:underline text-xs font-bold flex items-center gap-1"
                >
                  <Play size={12} /> تشغيل
                </a>
              </div>
              <div className="text-right flex-1 pr-3">
                <div className="flex items-center gap-2 justify-end">
                  <h4 className="font-bold text-sm text-gray-800">{search.name}</h4>
                  {search.hasNewMatches && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <BellRing size={10} /> {search.newMatchCount} جديد
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {filters.city || ''} · {filters.bedrooms ? `${filters.bedrooms} غرف` : ''} · {filters.budgetMax ? `≤ ${(filters.budgetMax / 1_000_000).toFixed(1)}M` : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
