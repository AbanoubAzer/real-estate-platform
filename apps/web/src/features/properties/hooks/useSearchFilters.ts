import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface SearchFilters {
  q?: string;
  purpose?: string;
  propertyTypeId?: string;
  city?: string;
  areaLocation?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  furnished?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export const useSearchFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<SearchFilters>(() => {
    const parsed: SearchFilters = {};
    
    const q = searchParams.get('q');
    if (q) parsed.q = q;

    const purpose = searchParams.get('purpose');
    if (purpose) parsed.purpose = purpose;

    const propertyTypeId = searchParams.get('propertyTypeId');
    if (propertyTypeId) parsed.propertyTypeId = propertyTypeId;

    const city = searchParams.get('city');
    if (city) parsed.city = city;

    const minPrice = searchParams.get('minPrice');
    if (minPrice) parsed.minPrice = Number(minPrice);

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) parsed.maxPrice = Number(maxPrice);

    const minArea = searchParams.get('minArea');
    if (minArea) parsed.minArea = Number(minArea);

    const maxArea = searchParams.get('maxArea');
    if (maxArea) parsed.maxArea = Number(maxArea);

    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) parsed.bedrooms = Number(bedrooms);

    const bathrooms = searchParams.get('bathrooms');
    if (bathrooms) parsed.bathrooms = Number(bathrooms);

    const features = searchParams.getAll('features');
    if (features.length > 0) parsed.features = features;

    const furnished = searchParams.get('furnished');
    if (furnished !== null) parsed.furnished = furnished === 'true';

    const sort = searchParams.get('sort');
    if (sort) parsed.sort = sort;

    const page = searchParams.get('page');
    parsed.page = page ? Number(page) : 1;

    const limit = searchParams.get('limit');
    parsed.limit = limit ? Number(limit) : 20;

    return parsed;
  }, [searchParams]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      
      if (value === undefined || value === null || value === '') {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        newParams.delete(key);
        value.forEach(v => newParams.append(key, v));
      } else {
        newParams.set(key, String(value));
      }
      
      // Reset page to 1 when filters change (unless the filter we changed WAS page)
      if (key !== 'page') {
        newParams.set('page', '1');
      }
      
      return newParams;
    });
  }, [setSearchParams]);

  const removeFilter = useCallback((key: keyof SearchFilters) => {
    updateFilter(key, null);
  }, [updateFilter]);

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    filters,
    updateFilter,
    removeFilter,
    clearAllFilters,
    searchString: searchParams.toString(),
  };
};
