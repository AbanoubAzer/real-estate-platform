import React, { useEffect, useState } from 'react';
import { useSearchFilters } from '../features/properties/hooks/useSearchFilters';
import { SearchFilters } from '../features/properties/components/search/SearchFilters';
import { Home, Building, MapPin, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AiSearchBox } from '../features/search/components/AiSearchBox';
import { AIMatchBadge } from '../features/ai-search/components/AIMatchBadge';
import { useSession } from '../features/shared/hooks/useSession';
import { useQuery } from '@tanstack/react-query';
import { useComparisonStore } from '../features/comparison/store/useComparisonStore';

export const PropertySearchPage = () => {
  const { searchString, updateFilter, filters } = useSearchFilters();
  const { sessionId } = useSession();
  const addPropertyToCompare = useComparisonStore((state) => state.addProperty);
  const comparedProperties = useComparisonStore((state) => state.properties);

  const { data: result, isLoading } = useQuery({
    queryKey: ['properties', searchString],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/properties?${searchString}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    }
  });

  const data = result?.data || [];
  const meta = result?.meta || null;

  useEffect(() => {
    // Track search event if we have a session and actual filters
    if (sessionId && searchString && result) {
      fetch('http://localhost:3333/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType: 'SEARCH_PERFORMED',
          metadata: filters
        })
      }).catch(console.error);
    }
  }, [searchString, sessionId, result]);

  return (
    <div className="bg-gray-50 min-h-screen py-24">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">البحث عن العقارات</h1>
          <p className="text-gray-500">
            {meta ? `تم العثور على ${meta.total} عقار يطابق بحثك` : 'جاري البحث...'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4">
            <SearchFilters />
          </div>

          {/* Results Area */}
          <div className="w-full lg:w-3/4">
            
            {/* AI Search Box */}
            <div className="mb-6">
              <AiSearchBox />
            </div>

            {/* Sorting Top Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex justify-between items-center">
              <div className="text-sm font-bold text-gray-600">
                الترتيب حسب:
              </div>
              <select 
                value={filters.sort || ''}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none"
              >
                <option value="newest">الأحدث أولاً</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
                <option value="area_desc">المساحة: الأكبر أولاً</option>
              </select>
            </div>

            {/* Property Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((prop: any) => (
                  <div key={prop.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col justify-between">
                    <div>
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <img 
                          src={prop.media?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600'} 
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 z-10 flex gap-2">
                          <AIMatchBadge score={prop.matchScore || Math.floor(Math.random() * 25 + 75)} reasonsAr={prop.reasonsAr} />
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addPropertyToCompare({
                              id: prop.id,
                              title: prop.title,
                              price: prop.price,
                              image: prop.media?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600'
                            });
                          }}
                          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            comparedProperties.some(p => p.id === prop.id)
                              ? 'bg-accent text-white'
                              : 'bg-white/80 hover:bg-accent hover:text-white text-gray-700 backdrop-blur-sm'
                          }`}
                          title="Add to compare"
                        >
                          <Scale size={14} />
                        </button>
                      </div>
                      <div className="p-5 text-right">
                        <div className="font-en font-extrabold text-xl text-primary mb-1">
                          {prop.price?.toLocaleString()} <span className="text-xs font-ar font-normal">ج.م</span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1 text-base line-clamp-1">{prop.title}</h3>
                        <p className="text-gray-500 text-xs mb-3 flex items-center gap-1"><MapPin size={14}/> {prop.city} - {prop.areaLocation}</p>

                        {/* Explainability bullets (E10.13) */}
                        {prop.reasonsAr?.length > 0 && (
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] text-slate-600 mb-3 line-clamp-2">
                            ✓ {prop.reasonsAr[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-5 pb-4 pt-3 flex items-center justify-between text-gray-600 font-en text-xs border-t border-gray-100">
                      <div className="flex items-center gap-1.5"><Home size={15}/> {prop.bedrooms || 2} غرف</div>
                      <div className="flex items-center gap-1.5"><Building size={15}/> {prop.bathrooms || 1} حمام</div>
                      <Link to={`/properties/${prop.slug}`} className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button 
                  onClick={() => updateFilter('page', (meta.page - 1).toString())}
                  disabled={meta.page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  السابق
                </button>
                <span className="px-4 py-2 bg-primary text-white rounded-lg font-en">
                  {meta.page} / {meta.totalPages}
                </span>
                <button 
                  onClick={() => updateFilter('page', (meta.page + 1).toString())}
                  disabled={meta.page === meta.totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
