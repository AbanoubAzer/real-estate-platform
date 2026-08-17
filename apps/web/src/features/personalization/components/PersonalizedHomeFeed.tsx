import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { Flame, Eye, Heart, TrendingUp, Sparkles, ChevronLeft, ChevronRight, Info, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  properties: any[];
  onFeedback?: (propertyId: string, type: string) => void;
}

const PropertyCard: React.FC<{ property: any; onFeedback?: (type: string) => void }> = ({ property, onFeedback }) => {
  const [showReasons, setShowReasons] = useState(false);
  const coverImage = property.media?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group min-w-[280px] max-w-[320px] flex-shrink-0 relative">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img src={coverImage} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {/* Match Score Badge */}
        {property.personalizedScore && (
          <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Sparkles size={12} className="text-[#EF8D00]" />
            %{property.personalizedScore} مطابقة
          </div>
        )}
        {/* Why this? button (E11.15) */}
        {property.reasons?.length > 0 && (
          <button
            onClick={(e) => { e.preventDefault(); setShowReasons(!showReasons); }}
            className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-white transition-all flex items-center gap-1"
          >
            <Info size={11} /> ليه ظهرلك؟
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 text-right space-y-2">
        <Link to={`/properties/${property.slug || property.id}`} className="block">
          <h3 className="font-bold text-gray-800 text-sm line-clamp-1 hover:text-primary transition-colors">{property.title}</h3>
        </Link>
        <p className="text-xs text-gray-400">{property.city || 'مصر'}</p>
        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
          <span className="font-bold font-en text-primary text-sm">{(property.price / 1_000_000).toFixed(1)}M EGP</span>
          <span className="text-[10px] text-gray-400">{property.bedrooms || '—'} غرف · {property.area || '—'} م²</span>
        </div>

        {/* Feedback buttons (E11.18) */}
        {onFeedback && (
          <div className="flex gap-2 pt-2">
            <button onClick={() => onFeedback('HELPFUL')} className="flex-1 text-[10px] py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-bold flex items-center justify-center gap-1 transition-all">
              <ThumbsUp size={11} /> مفيد
            </button>
            <button onClick={() => onFeedback('NOT_INTERESTED')} className="flex-1 text-[10px] py-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 font-bold flex items-center justify-center gap-1 transition-all">
              <ThumbsDown size={11} /> مش مهتم
            </button>
          </div>
        )}
      </div>

      {/* Explainability Popover (E11.15) */}
      {showReasons && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-primary p-4 shadow-xl rounded-t-xl animate-in slide-in-from-bottom z-10 text-right">
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => setShowReasons(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            <h4 className="text-xs font-bold text-gray-800">ليه العقار ده ظاهرلك؟</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-600">
            {property.reasons.map((r: string, i: number) => (
              <li key={i} className="flex items-center gap-1.5">{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Section: React.FC<SectionProps> = ({ title, icon, properties, onFeedback }) => {
  if (properties.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-right">
        {icon}
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2.5 py-0.5 rounded-full font-en">{properties.length}</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {properties.map((prop: any) => (
          <PropertyCard key={prop.id} property={prop} onFeedback={onFeedback ? (type) => onFeedback(prop.id, type) : undefined} />
        ))}
      </div>
    </div>
  );
};

export const PersonalizedHomeFeed: React.FC = () => {
  const { token } = useAuth();

  const { data: feed, isLoading } = useQuery({
    queryKey: ['personalizedFeed'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/me/recommendations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch personalized feed');
      return res.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const handleFeedback = async (propertyId: string, feedbackType: string) => {
    try {
      await fetch(`http://localhost:3333/me/recommendations/${propertyId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feedbackType }),
      });
    } catch (e) {
      console.error('Feedback failed', e);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded-lg" />
            <div className="flex gap-4">
              {[1, 2, 3].map((j) => <div key={j} className="w-72 h-64 bg-gray-100 rounded-2xl flex-shrink-0" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!feed) return null;

  return (
    <div className="space-y-10">
      <Section
        title="🔥 مختار خصيصاً لك"
        icon={<Flame size={20} className="text-red-500" />}
        properties={feed.pickedForYou || []}
        onFeedback={handleFeedback}
      />
      <Section
        title="👀 لأنك شاهدت مؤخراً"
        icon={<Eye size={20} className="text-blue-500" />}
        properties={feed.becauseYouViewed || []}
        onFeedback={handleFeedback}
      />
      <Section
        title="❤️ مشابه لمفضلاتك"
        icon={<Heart size={20} className="text-pink-500" />}
        properties={feed.similarToFavorites || []}
        onFeedback={handleFeedback}
      />
      <Section
        title="📈 فرص استثمارية"
        icon={<TrendingUp size={20} className="text-emerald-500" />}
        properties={feed.investmentOpportunities || []}
        onFeedback={handleFeedback}
      />
      <Section
        title="🆕 عقارات جديدة مطابقة"
        icon={<Sparkles size={20} className="text-amber-500" />}
        properties={feed.newMatches || []}
        onFeedback={handleFeedback}
      />
    </div>
  );
};
