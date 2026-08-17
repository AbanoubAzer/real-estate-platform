import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Lightbulb, ArrowLeft, Sliders, Check } from 'lucide-react';

interface AISearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string, parsedResult?: any) => void;
}

export const AISearchBar: React.FC<AISearchBarProps> = ({ initialQuery = '', onSearch }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const navigate = useNavigate();

  const sampleQueries = [
    'عايز شقة 3 غرف في الغردقة بحد أقصى 4 مليون وتقسيط',
    'شاليه قريب من البحر في الجونة مناسب للاستثمار',
    'شقة مفروشة في الشيخ زايد للإيجار بأقل من 20 ألف',
    'فيلا للبيع في التجمع الخامس بمقدم 1 مليون',
  ];

  const handleParseAndSubmit = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3333/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setParsedResult(data);

        if (onSearch) {
          onSearch(searchQuery, data);
        } else {
          navigate(`/search?q=${encodeURIComponent(searchQuery)}&ai=true`);
        }
      }
    } catch (err) {
      console.error('AI Parsing Error:', err);
      if (!onSearch) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 text-right">
      {/* Main Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleParseAndSubmit(query);
        }}
        className="relative flex items-center bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-gray-100"
      >
        <div className="flex-1 flex items-center pr-4 pl-2 gap-3">
          <Sparkles className="text-accent animate-pulse shrink-0" size={24} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باللغة الطبيعية (مثال: عايز شقة في الغردقة قريبة من البحر غرفتين وتقسيط)..."
            className="w-full py-3 bg-transparent text-gray-800 text-sm md:text-base focus:outline-none placeholder:text-gray-400 text-right"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-navy text-white px-6 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-primary/30 shrink-0"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Search size={18} />
              <span>بحث ذكي</span>
            </>
          )}
        </button>
      </form>

      {/* Sample Query Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 px-1">
        <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
          <Lightbulb size={13} className="text-amber-500" />
          جرب البحث بـ:
        </span>
        {sampleQueries.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(sample);
              handleParseAndSubmit(sample);
            }}
            className="text-xs bg-white/80 hover:bg-white text-gray-600 hover:text-primary px-3 py-1 rounded-full border border-gray-200 shadow-sm transition-all"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Real-time Extracted Filters Preview (E10.2 & E10.3) */}
      {parsedResult && (
        <div className="bg-gradient-to-br from-slate-900 to-navy text-white p-5 rounded-2xl shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="bg-accent text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                نية البحث: {parsedResult.intent}
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check size={14} /> دقة التحليل %{Math.round((parsedResult.confidence || 0.9) * 100)}
              </span>
            </div>
            <span className="text-xs text-gray-300 font-bold">الفلاتر المستخرجة تلقائياً</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {parsedResult.filters?.location?.map((loc: string, idx: number) => (
              <span key={idx} className="bg-white/15 text-white text-xs px-3 py-1 rounded-lg border border-white/20">
                📍 المدينة: {loc}
              </span>
            ))}
            {parsedResult.filters?.propertyType && (
              <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-lg border border-white/20">
                🏠 النوع: {parsedResult.filters.propertyType}
              </span>
            ))}
            {parsedResult.filters?.bedrooms?.min && (
              <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-lg border border-white/20">
                🛏️ الغرف: {parsedResult.filters.bedrooms.min}+
              </span>
            ))}
            {parsedResult.filters?.maxPrice && (
              <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-lg border border-white/20">
                💰 أقصى سعر: {parsedResult.filters.maxPrice.toLocaleString()} ج.م
              </span>
            ))}
            {parsedResult.filters?.paymentPlan?.enabled && (
              <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-lg border border-white/20">
                💳 أنظمة تقسيط: متاحة
              </span>
            ))}
          </div>

          {/* Smart Suggestions (E10.3) */}
          {parsedResult.suggestions?.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                <Lightbulb size={14} /> مقترحات ذكية لتحسين نتائجك:
              </p>
              <div className="flex flex-wrap gap-2">
                {parsedResult.suggestions.map((sugg: any, idx: number) => (
                  <span key={idx} className="bg-amber-500/20 text-amber-200 text-xs px-3 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                    <span>+ {sugg.labelAr}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
