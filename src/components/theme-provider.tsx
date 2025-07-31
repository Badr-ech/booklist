'use client';

import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'fantasy' | 'romance' | 'scifi' | 'horror' | 'thriller' | 'historical';

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'vite-ui-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const { user, loading: authLoading } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
     if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const applyTheme = useCallback((themeToApply: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove(
      'light',
      'dark',
      'theme-fantasy',
      'theme-romance',
      'theme-scifi',
      'theme-horror',
      'theme-thriller',
      'theme-historical'
    );

    let finalThemeClass = '';
    if (themeToApply === 'dark' || themeToApply === 'light') {
        finalThemeClass = themeToApply;
    } else {
        finalThemeClass = `theme-${themeToApply}`;
    }
    
    root.classList.add(finalThemeClass);
  }, []);


  useEffect(() => {
    async function fetchAndApplyUserTheme() {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const favoriteGenre = userDoc.data()?.favoriteGenre?.toLowerCase();
            // Map genre names to theme names
            const genreToTheme: { [key: string]: Theme } = {
              'fantasy': 'fantasy',
              'romance': 'romance', 
              'sci-fi': 'scifi',
              'science fiction': 'scifi',
              'horror': 'horror',
              'thriller': 'thriller',
              'historical': 'historical',
              'mystery': 'thriller', // Map mystery to thriller
              'crime': 'thriller',   // Map crime to thriller
            };
            
            const mappedTheme = genreToTheme[favoriteGenre] || 'fantasy';
            setThemeState(mappedTheme);
          }
        } catch (e) {
          console.error("Failed to fetch user theme", e);
        }
      }
    }
    if (isClient && !authLoading) {
      fetchAndApplyUserTheme();
    }
  }, [user, authLoading, isClient]);
  
  useEffect(() => {
    if(isClient) {
      applyTheme(theme);
      localStorage.setItem(storageKey, theme);
    }
  }, [theme, storageKey, applyTheme, isClient]);

  const setTheme = (newTheme: Theme) => {
     if(isClient) {
        setThemeState(newTheme);
        localStorage.setItem(storageKey, newTheme);
     }
  };

  const value = {
    theme,
    setTheme,
  };

  if (!isClient) {
    return null;
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
