import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { routeConfig, RouteConfig } from '@/config/routes';

export interface NavigationEntry {
  path: string;
  title: string;
  icon: RouteConfig['icon'];
  timestamp: Date;
}

interface NavigationHistoryContextType {
  history: NavigationEntry[];
  addToHistory: (path: string) => void;
  clearHistory: () => void;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'navigationHistory';
const MAX_HISTORY_SIZE = 5;

export const NavigationHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [history, setHistory] = useState<NavigationEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          icon: routeConfig[entry.path]?.icon,
        })).filter((entry: NavigationEntry) => entry.icon);
      }
    } catch (error) {
      console.error('Error loading navigation history:', error);
    }
    return [];
  });

  const addToHistory = useCallback((path: string) => {
    const config = routeConfig[path];
    if (!config) return;

    const newEntry: NavigationEntry = {
      path,
      title: config.title,
      icon: config.icon,
      timestamp: new Date(),
    };

    setHistory(prev => {
      // Don't add if the last entry is the same path
      if (prev[0]?.path === path) {
        // Update timestamp of existing entry
        return [{ ...prev[0], timestamp: new Date() }, ...prev.slice(1)];
      }

      // Remove existing entry for this path if it exists
      const filtered = prev.filter(entry => entry.path !== path);

      // Add new entry at the beginning and limit size
      return [newEntry, ...filtered].slice(0, MAX_HISTORY_SIZE);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    const toStore = history.map(entry => ({
      path: entry.path,
      title: entry.title,
      timestamp: entry.timestamp.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [history]);

  // Track navigation changes
  useEffect(() => {
    const path = location.pathname;
    
    // Don't track login page or routes not in config
    if (path === '/login' || path === '/' || !routeConfig[path]) {
      return;
    }

    addToHistory(path);
  }, [location.pathname, addToHistory]);

  return (
    <NavigationHistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

export const useNavigationHistory = () => {
  const context = useContext(NavigationHistoryContext);
  if (context === undefined) {
    throw new Error('useNavigationHistory must be used within a NavigationHistoryProvider');
  }
  return context;
};
