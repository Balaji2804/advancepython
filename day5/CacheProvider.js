import React, { createContext, useState, useEffect } from 'react';
import { getPlatformsData } from '../api';

const CacheContext = createContext(null);

const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({ platforms: [], teams: [], groups: [] });
  const [loading, setLoading] = useState(true);

  // Update cache for individual application
  const updateApplicationInCache = (updatedApp) => {
    setCache(prevCache => ({
      ...prevCache,
      platforms: prevCache.platforms.map(app =>
        app.AppName === updatedApp.AppName ? updatedApp : app
      )
    }));
  };

  // Update entire cache (for group operations or initial load)
  const updateCacheOnRegionChange = (applications, teams, groups) => {
    setCache(prevCache => ({
      ...prevCache,
      platforms: applications || prevCache.platforms,
      teams: teams || prevCache.teams,
      groups: groups || prevCache.groups
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await getPlatformsData();
        setCache({
          platforms: data.applications || [],
          teams: data.groups || [],
          groups: data.groups || []
        });
      } catch (error) {
        console.error('Error fetching cache data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      setLoading(false);
      setCache({ platforms: [], teams: [], groups: [] });
    };
  }, []);

  // Debug log for cache updates
  useEffect(() => {
    console.log('Cache updated:', cache);
  }, [cache]);

  return (
    <CacheContext.Provider
      value={{
        cache,
        updateCacheOnRegionChange,
        updateApplicationInCache,
        loading
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};

export { CacheContext, CacheProvider };
