import React from 'react';
import { useComparisonStore } from '../store/useComparisonStore';
import { X, Scale, ChevronUp, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ComparisonTray() {
  const { properties, removeProperty, clear, isOpen, setIsOpen } = useComparisonStore();
  const navigate = useNavigate();

  if (properties.length === 0) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      
      {/* Toggle Tab */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -top-10 right-6 bg-primary text-white px-4 py-2 rounded-t-xl font-bold shadow-lg flex items-center gap-2 hover:bg-primary/90"
      >
        <Scale size={18} />
        المقارنة ({properties.length}/4)
        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {/* Tray Content */}
      <div className="bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 md:p-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex-1 flex gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full">
            {properties.map((p) => (
              <div key={p.id} className="relative flex-shrink-0 w-32 md:w-48 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                <button 
                  onClick={() => removeProperty(p.id)}
                  className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white text-gray-700 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors"
                >
                  <X size={14} />
                </button>
                <img src={p.image} alt={p.title} className="h-16 md:h-20 w-full object-cover" />
                <div className="p-2 text-center text-xs md:text-sm font-bold truncate">
                  {p.title}
                </div>
              </div>
            ))}

            {Array.from({ length: 4 - properties.length }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-32 md:w-48 h-24 md:h-28 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50/50">
                <div className="text-center text-xs">
                  <Scale size={20} className="mx-auto mb-1 opacity-50" />
                  أضف عقار
                </div>
              </div>
            ))}
          </div>

          <div className="flex md:flex-col gap-3 min-w-[150px]">
            <button 
              onClick={() => navigate('/compare')}
              disabled={properties.length < 2}
              className={`w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                properties.length >= 2 
                  ? 'bg-accent text-white hover:bg-accent/90 shadow-md hover:shadow-lg' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              مقارنة الآن
            </button>
            <button 
              onClick={clear}
              className="text-gray-500 hover:text-red-500 text-sm font-bold"
            >
              مسح الكل
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
