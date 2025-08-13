'use client';

import { AppLayout } from '@/components/app-layout';
import { ActivityFeed } from '@/components/activity-feed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Activity } from 'lucide-react';

export default function ActivityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Activity Feed
          </h2>
          <p className="text-muted-foreground">
            See what your friends are reading and track your own activity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed showOwnActivities={true} limitCount={50} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Tips</CardTitle>
                <CardDescription>Make the most of your activity feed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">📚 Track Your Reading</h4>
                  <p className="text-sm text-muted-foreground">
                    Add books to your list and update their status to share your progress.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">⭐ Rate & Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Share your thoughts with ratings and reviews for others to discover.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">👥 Follow Friends</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow other readers to see their activity and get book recommendations.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">🎯 Set Goals</h4>
                  <p className="text-sm text-muted-foreground">
                    Update your reading goals to motivate yourself and share milestones.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy</CardTitle>
                <CardDescription>Your activity visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your activities are visible to users who follow you. You can control what gets shared by managing your profile settings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
