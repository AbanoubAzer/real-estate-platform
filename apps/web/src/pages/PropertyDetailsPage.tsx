import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { PropertyGallery } from '../features/properties/components/details/PropertyGallery';
import { ContactAgentCard } from '../features/properties/components/details/ContactAgentCard';
import { SimilarProperties } from '../features/properties/components/details/SimilarProperties';
import { PropertySpecifications } from '../features/properties/components/details/PropertySpecifications';
import { PropertyPaymentPlan } from '../features/properties/components/details/PropertyPaymentPlan';
import { AiMatchExplanation } from '../features/properties/components/details/AiMatchExplanation';
import { PropertyLocation } from '../features/properties/components/details/PropertyLocation';
import { PersonalizedRecommendations } from '../features/ai-search/components/PersonalizedRecommendations';
import { useSession } from '../features/shared/hooks/useSession';
import { MapPin, Home, Building, Check, Share2, Heart, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

export const PropertyDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const matchScore = searchParams.get('matchScore');
  const { sessionId } = useSession();
  
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', slug],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3333/properties/${slug}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: !!slug
  });

  useEffect(() => {
    // Track View (PD-14) with Analytics when property data is loaded
    if (property?.id && sessionId) {
      fetch(`http://localhost:3333/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType: 'PROPERTY_VIEWED',
          propertyId: property.id,
          metadata: { source: 'DIRECT' }
        })
      }).catch(e => console.error('Failed to track view', e));
    }
  }, [property?.id, sessionId]);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId || !property?.id) return;
      return fetch(`http://localhost:3333/properties/${property.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sessionId })
      });
    },
    onMutate: () => {
      setIsFavorite(!isFavorite); // Optimistic update
    }
  });

  const reportMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!sessionId || !property?.id) return;
      return fetch(`http://localhost:3333/properties/${property.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sessionId, reason, details: '' })
      });
    },
    onSuccess: () => {
      alert('تم إرسال البلاغ بنجاح للتحقيق');
    }
  });

  const handleFavorite = () => {
    favoriteMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title || '',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = () => {
    const reason = prompt("ما هو سبب الإبلاغ عن هذا العقار؟");
    if (reason) {
      reportMutation.mutate(reason);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-800">العقار غير موجود</h1>
        <Link to="/search" className="text-primary underline">العودة للبحث</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-24">
      <div className="container mx-auto px-6">
        
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-primary">العقارات</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{property.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area (RTL Right) */}
          <div className="w-full lg:w-2/3 space-y-8">
            
            {matchScore && <AiMatchExplanation matchScore={Number(matchScore)} />}

            {/* Gallery */}
            <PropertyGallery media={property.media || []} />

            {/* Basic Info & Price */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="inline-block px-3 py-1 bg-accent/10 text-accent font-bold text-sm rounded-lg">
                      {property.purpose === 'SALE' ? 'للبيع' : 'للإيجار'}
                    </div>
                    {property.status === 'RESERVED' && (
                      <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 font-bold text-sm rounded-lg">
                        محجوز
                      </div>
                    )}
                    {property.status === 'SOLD' && (
                      <div className="inline-block px-3 py-1 bg-red-100 text-red-600 font-bold text-sm rounded-lg">
                        مباع
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-2">
                    {property.title}
                  </h1>
                  <p className="text-gray-500 flex items-center gap-2">
                    <MapPin size={18} />
                    {property.areaLocation}، {property.city}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-en font-black text-3xl md:text-4xl text-primary leading-none">
                    {property.price.toLocaleString()}
                  </div>
                  <div className="text-gray-500 font-bold mt-1">{property.currency}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-8 left-8 flex gap-3">
                <button onClick={handleFavorite} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600 hover:text-red-500 hover:bg-red-50'}`}>
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Detailed Specifications */}
            <PropertySpecifications property={property} />

            {/* Payment Plan */}
            {(property.purpose === 'SALE' || property.paymentMethod) && (
              <PropertyPaymentPlan property={property} />
            )}

            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">الوصف</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Features (PD-06) */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">المميزات والخدمات</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                  {property.features.map((pf: any) => (
                    <div key={pf.featureId} className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      {pf.feature.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location / Map (Simplified PD-07) */}
            <PropertyLocation property={property} />

          </div>

          {/* Sidebar Area (RTL Left) */}
          <div className="w-full lg:w-1/3">
            <ContactAgentCard propertyId={property.id} />
            
            <div className="mt-6 bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-primary shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">حماية المشتري</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    نحن نضمن لك تجربة آمنة. قم دائماً بمعاينة العقار بنفسك ولا تقم بتحويل أي مبالغ مالية قبل توقيع العقود الرسمية.
                  </p>
                  <button onClick={handleReport} className="text-red-500 font-bold text-sm flex items-center gap-2 hover:text-red-600 transition-colors">
                    <AlertTriangle size={16} />
                    الإبلاغ عن هذا العقار
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Smart Similar Properties (E10.9 & E10.13) */}
        <div className="mt-12">
          <PersonalizedRecommendations propertyId={property.id} titleAr="عقارات مشابهة مقترحة لك بالذكاء الاصطناعي" limit={4} />
        </div>
      </div>
    </div>
  );
};
