import React from 'react';
import { useSession } from '../../shared/hooks/useSession';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export const ContinueViewing = () => {
  const { sessionId } = useSession();

  const { data: property } = useQuery({
    queryKey: ['lastViewed', sessionId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3333/analytics/last-viewed/${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch last viewed');
      const data = await res.json();
      return data?.id ? data : null;
    },
    enabled: !!sessionId
  });

  if (!property) return null;

  return (
    <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl flex items-center justify-between gap-4 mt-8">
      <div className="flex items-center gap-4">
        {property.media && property.media.length > 0 ? (
          <img src={property.media[0].url} alt={property.title} className="w-16 h-16 rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
            <Home className="text-white" />
          </div>
        )}
        <div>
          <h4 className="text-white/80 text-xs font-medium mb-1">متابعة التصفح</h4>
          <h3 className="text-white font-bold text-sm md:text-base line-clamp-1">{property.title}</h3>
          <p className="text-white/70 text-xs mt-1 font-en">{property.price?.toLocaleString()} <span className="font-ar">ج.م</span></p>
        </div>
      </div>
      
      <Link 
        to={`/properties/${property.slug}`}
        className="bg-accent hover:bg-[#d97c00] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
      >
        استمرار <ArrowLeft size={16} />
      </Link>
    </div>
  );
};
