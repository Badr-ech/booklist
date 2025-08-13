'use client';

import { useAuth } from '@/components/auth-provider';
import { LandingHeader } from '@/components/landing-header';
import { HeroSection } from '@/components/landing/hero-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { AppLayout } from '@/components/app-layout';
import { AuthenticatedDashboard } from '@/components/authenticated-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-16 border-b bg-background/95 backdrop-blur">
          <div className="container px-4 h-full flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Show authenticated dashboard if user is logged in
  if (user) {
    return (
      <AppLayout>
        <AuthenticatedDashboard />
      </AppLayout>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-headline">
                  Join thousands of book lovers
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground">
                  Track your reading, discover new books with AI recommendations, and connect with a community of passionate readers.
                </p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
                <div className="text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">Track Your Reading</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize your books by status: reading, completed, want to read, and more.
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">AI Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized book suggestions powered by advanced AI algorithms.
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">Connect & Discover</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow other readers, join book clubs, and participate in reading challenges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
