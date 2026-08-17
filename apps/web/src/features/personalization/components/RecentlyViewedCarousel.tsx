import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import { Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentlyViewedCarousel: React.FC = () => {
  const { token } = useAuth();

  const { data: recentItems } = useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/me/recently-viewed?limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token,
  });

  const { data: continueData } = useQuery({
    queryKey: ['continueExploring'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3333/me/continue-exploring', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!token,
  });

  if (!recentItems || recentItems.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Continue Exploring Banner (E11.6) */}
      {continueData && (
        <div className="bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 flex justify-between items-center">
          <Link to="/search" className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5">
            أكمل البحث <ArrowLeft size={14} />
          </Link>
          <div className="text-right">
            <p className="text-primary font-bold text-sm mb-0.5">أكمل استكشافك 🔎</p>
            <p className="text-gray-600 text-xs">{continueData.titleAr}</p>
          </div>
        </div>
      )}

      {/* Recently Viewed Carousel (E11.5) */}
      <div className="flex items-center justify-between">
        <Link to="/search" className="text-primary text-xs font-bold hover:underline">عرض الكل</Link>
        <div className="flex items-center gap-2 text-right">
          <h2 className="text-lg font-bold text-gray-800">شاهدت مؤخراً</h2>
          <Clock size={18} className="text-gray-400" />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
        {recentItems.map((item: any) => {
          const prop = item.property;
          const coverImage = prop?.media?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop';

          return (
            <Link
              key={item.id}
              to={`/properties/${prop?.slug || prop?.id}`}
              className="min-w-[200px] bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all flex-shrink-0 group"
            >
              <div className="h-28 overflow-hidden">
                <img src={coverImage} alt={prop?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-3 text-right">
                <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{prop?.title}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">{prop?.city} · {item.viewCount}x مشاهدة</p>
                <p className="text-xs font-bold font-en text-primary mt-1">{(prop?.price / 1_000_000).toFixed(1)}M</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
