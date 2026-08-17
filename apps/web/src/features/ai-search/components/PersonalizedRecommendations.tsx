import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, MapPin, Building, ArrowLeft } from 'lucide-react';
import { AIMatchBadge } from './AIMatchBadge';
import { Link } from 'react-router-dom';

interface RecommendationsProps {
  propertyId?: string; // If provided, shows similar properties for this property
  titleAr?: string;
  limit?: number;
}

export const PersonalizedRecommendations: React.FC<RecommendationsProps> = ({
  propertyId,
  titleAr,
  limit = 4,
}) => {
  const isSimilar = Boolean(propertyId);
  const endpoint = isSimilar
    ? `http://localhost:3333/ai/properties/${propertyId}/similar?limit=${limit}`
    : `http://localhost:3333/ai/recommendations?limit=${limit}`;

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['aiRecommendations', propertyId || 'personalized'],
    queryFn: async () => {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
        {[1, 2, 3, 4].slice(0, limit).map((n) => (
          <div key={n} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (properties.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex justify-between items-end mb-6 text-right">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
            <Sparkles size={18} className="text-accent animate-pulse" />
            <span>توصيات الذكاء الاصطناعي</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {titleAr || (isSimilar ? 'عقارات مشابهة قد تعجبك' : 'مقترحة خصيصاً لك')}
          </h2>
        </div>
        <Link to="/search" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
          استكشف المزيد &larr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((prop: any) => (
          <div
            key={prop.id}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              {/* Cover Image & Badges */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    prop.media?.[0]?.url ||
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
                  }
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="bg-navy/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {prop.purpose === 'SALE' ? 'للبيع' : 'للإيجار'}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <AIMatchBadge score={prop.matchScore || 88} reasonsAr={prop.reasonsAr} />
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5 text-right">
                <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {prop.title}
                </h3>
                <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" /> {prop.city} - {prop.areaLocation}
                </p>

                {/* Reasons List Preview (E10.13) */}
                {prop.reasonsAr?.length > 0 && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 text-[11px] text-slate-600 space-y-1">
                    <p className="font-bold text-primary text-[10px] mb-1">سبب الترشيح:</p>
                    <p className="line-clamp-2">✓ {prop.reasonsAr[0]}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Footer */}
            <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-primary font-extrabold text-lg">
                {prop.price?.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </span>
              <Link
                to={`/properties/${prop.slug}`}
                className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                عرض التفاصيل
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
