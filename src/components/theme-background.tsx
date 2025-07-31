'use client';

import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden",
      theme === 'fantasy' && "theme-fantasy",
      theme === 'scifi' && "theme-scifi", 
      theme === 'horror' && "theme-horror",
      theme === 'romance' && "theme-romance",
      theme === 'thriller' && "theme-thriller",
      theme === 'historical' && "theme-historical"
    )}>
      {/* Genre-specific background elements */}
      {theme === 'fantasy' && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
        </div>
      )}
      
      {theme === 'scifi' && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="absolute top-1/4 right-10 w-2 h-32 bg-gradient-to-b from-cyan-500/30 to-transparent blur-sm" />
        </div>
      )}
      
      {theme === 'horror' && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-40 h-40 bg-red-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-10 w-60 h-60 bg-red-800/10 rounded-full blur-3xl" />
        </div>
      )}
      
      {theme === 'romance' && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-36 h-36 bg-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-rose-300/15 rounded-full blur-3xl" />
          <div className="absolute top-3/4 left-1/2 w-24 h-24 bg-pink-400/25 rounded-full blur-2xl" />
        </div>
      )}
      
      {theme === 'thriller' && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent" />
        </div>
      )}
      
      {theme === 'historical' && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl" />
        </div>
      )}
      
      {children}
    </div>
  );
}
