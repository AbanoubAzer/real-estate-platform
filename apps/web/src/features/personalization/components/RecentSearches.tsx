import React from 'react';
import { useSession } from '../../shared/hooks/useSession';
import { Search, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export const RecentSearches = () => {
  const { sessionId } = useSession();

  const { data: searches = [] } = useQuery({
    queryKey: ['recentSearches', sessionId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3333/analytics/recent-searches/${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch recent searches');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!sessionId
  });

  if (searches.length === 0) return null;

  return (
    <div className="mt-6 w-full max-w-3xl text-right">
      <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
        <Clock size={16} /> عمليات البحث الأخيرة
      </h3>
      <div className="flex flex-wrap gap-2">
        {searches.filter(s => s != null).map((search, idx) => {
          // Construct a display string from filters
          const label = search?.query || 
                        `${search?.bedrooms || ''} غرف ${search?.propertyTypeId ? 'في' : ''} ${search?.city || 'عقارات'}`.trim();
                        
          return (
            <Link 
              key={idx}
              to={`/search?${new URLSearchParams(search).toString()}`}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Search size={14} />
              {label || 'بحث سابق'}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
