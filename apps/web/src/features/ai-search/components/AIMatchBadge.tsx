import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Info, ChevronDown } from 'lucide-react';

interface AIMatchBadgeProps {
  score?: number; // 0 - 100
  reasonsAr?: string[];
  reasonsEn?: string[];
  compact?: boolean;
}

export const AIMatchBadge: React.FC<AIMatchBadgeProps> = ({
  score = 85,
  reasonsAr = [],
  reasonsEn = [],
  compact = false,
}) => {
  const [showPopover, setShowPopover] = useState(false);

  // Color coding by score
  const getBadgeColor = (s: number) => {
    if (s >= 90) return 'bg-emerald-500 text-white shadow-emerald-500/20';
    if (s >= 80) return 'bg-primary text-white shadow-primary/20';
    if (s >= 70) return 'bg-blue-600 text-white shadow-blue-500/20';
    return 'bg-amber-500 text-white shadow-amber-500/20';
  };

  const defaultReasonsAr = [
    'يناسب الميزانية المحددة',
    'يتطابق مع عدد الغرف المطلوبة',
    'متاح بأنظمة تقسيط مرخة',
    'يقع في المنطقة المفضلة لك',
  ];

  const displayReasonsAr = reasonsAr.length > 0 ? reasonsAr : defaultReasonsAr;

  return (
    <div className="relative inline-block text-right">
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowPopover(!showPopover);
        }}
        className={`inline-flex items-center gap-1.5 font-bold rounded-full transition-all hover:scale-105 shadow-md ${getBadgeColor(
          score
        )} ${compact ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs md:text-sm'}`}
      >
        <Sparkles size={compact ? 12 : 14} className="animate-pulse" />
        <span className="font-en font-extrabold">{score}%</span>
        <span>تطابق</span>
        <ChevronDown size={compact ? 12 : 14} className={`transition-transform ${showPopover ? 'rotate-180' : ''}`} />
      </button>

      {/* Explainability Popover (E10.13) */}
      {showPopover && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 bottom-full mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95"
        >
          <div className="flex justify-between items-center pb-2 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
              <Sparkles size={16} />
              <span>لماذا يناسبك هذا العقار؟</span>
            </div>
            <button
              onClick={() => setShowPopover(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              &times;
            </button>
          </div>

          <div className="space-y-2">
            {displayReasonsAr.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
            <span>تم التحليل بالذكاء الاصطناعي</span>
            <span className="font-en">AI Match Engine v2</span>
          </div>
        </div>
      )}
    </div>
  );
};
