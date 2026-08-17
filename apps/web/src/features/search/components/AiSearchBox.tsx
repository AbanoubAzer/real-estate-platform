import React, { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useSearchFilters } from '../../properties/hooks/useSearchFilters';

export const AiSearchBox = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateFilter } = useSearchFilters();

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:3333/properties/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const filters = await res.json();
      
      // Map AI extracted filters to our search context
      Object.entries(filters).forEach(([key, value]) => {
        updateFilter(key as any, value as any);
      });
      
      setQuery(''); // clear after success
    } catch (error) {
      console.error('AI Search failed', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl mb-8 shadow-lg">
      <div className="bg-white rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4 text-purple-600">
          <Sparkles size={20} />
          <h2 className="font-bold text-lg">البحث الذكي بالذكاء الاصطناعي</h2>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          اكتب ما تبحث عنه بلغتك وسيقوم الذكاء الاصطناعي باستخراج الفلاتر تلقائياً. مثال: "عايز شقة 3 غرف في التجمع للسكن، كاش لحد 4 مليون"
        </p>
        
        <form onSubmit={handleAiSearch} className="relative">
          <input 
            type="text" 
            placeholder="ما الذي تبحث عنه؟..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-right pr-4 pl-14"
          />
          <button 
            type="submit"
            disabled={isProcessing || !query.trim()}
            className="absolute left-2 top-2 bottom-2 w-10 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <ArrowLeft size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
