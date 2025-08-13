'use client';

import { AppLayout } from '@/components/app-layout';
import { UserSearch } from '@/components/user-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';

export default function DiscoverPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Discover Users</h2>
            <p className="text-muted-foreground">
              Find and follow other book lovers in the community
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UserSearch />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Find Users</h4>
                  <p className="text-sm text-muted-foreground">
                    Search for other readers by their email address to start building your reading network.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Follow Readers</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow users to see their reading activity and get book recommendations based on their taste.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Build Community</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with like-minded readers and discover your next favorite book through social connections.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Activity feed from followed users</p>
                  <p>• Recommended users based on reading taste</p>
                  <p>• Popular users in your favorite genres</p>
                  <p>• Reading groups and book clubs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
