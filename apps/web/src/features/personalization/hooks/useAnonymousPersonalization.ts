import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'amlak_anon_personalization';

interface AnonymousProfile {
  sessionId: string;
  viewedProperties: string[];
  searchQueries: string[];
  favoriteProperties: string[];
  appliedFilters: any[];
  createdAt: string;
}

function generateSessionId(): string {
  return 'anon_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getStoredProfile(): AnonymousProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const profile: AnonymousProfile = {
    sessionId: generateSessionId(),
    viewedProperties: [],
    searchQueries: [],
    favoriteProperties: [],
    appliedFilters: [],
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * Hook for anonymous user personalization (E11.22)
 * Tracks views, searches, favorites in localStorage.
 * On login, merges with authenticated user profile.
 */
export function useAnonymousPersonalization() {
  const [profile, setProfile] = useState<AnonymousProfile>(getStoredProfile);

  const save = useCallback((updated: AnonymousProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfile(updated);
  }, []);

  const trackView = useCallback((propertyId: string) => {
    const current = getStoredProfile();
    if (!current.viewedProperties.includes(propertyId)) {
      current.viewedProperties = [propertyId, ...current.viewedProperties].slice(0, 50);
      save(current);
    }
  }, [save]);

  const trackSearch = useCallback((query: string) => {
    const current = getStoredProfile();
    current.searchQueries = [query, ...current.searchQueries].slice(0, 20);
    save(current);
  }, [save]);

  const trackFavorite = useCallback((propertyId: string) => {
    const current = getStoredProfile();
    if (!current.favoriteProperties.includes(propertyId)) {
      current.favoriteProperties.push(propertyId);
      save(current);
    }
  }, [save]);

  const trackFilters = useCallback((filters: any) => {
    const current = getStoredProfile();
    current.appliedFilters = [filters, ...current.appliedFilters].slice(0, 10);
    save(current);
  }, [save]);

  /**
   * Merge anonymous data into authenticated user profile (E11.22)
   */
  const mergeWithUser = useCallback(async (token: string) => {
    const current = getStoredProfile();
    if (current.viewedProperties.length === 0 && current.favoriteProperties.length === 0) return;

    try {
      // Record anonymous views into user profile
      for (const propId of current.viewedProperties.slice(0, 10)) {
        await fetch(`http://localhost:3333/me/recently-viewed/${propId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Record anonymous favorites
      for (const propId of current.favoriteProperties) {
        await fetch(`http://localhost:3333/me/favorites/${propId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Clear anonymous profile after merge
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Anonymous profile merge failed', e);
    }
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(getStoredProfile());
  }, []);

  return {
    profile,
    trackView,
    trackSearch,
    trackFavorite,
    trackFilters,
    mergeWithUser,
    clearProfile,
    hasAnonymousData: profile.viewedProperties.length > 0 || profile.favoriteProperties.length > 0,
  };
}
