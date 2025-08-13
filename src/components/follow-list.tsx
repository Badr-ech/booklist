'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getFollowers, getFollowing, getFollowStats } from '@/app/actions';
import { UserFollow, FollowStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FollowButton } from '@/components/follow-button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Loader2 } from 'lucide-react';

interface FollowListProps {
  userId: string;
  showStats?: boolean;
}

export function FollowList({ userId, showStats = true }: FollowListProps) {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [stats, setStats] = useState<FollowStats>({ followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('followers');

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;

      setLoading(true);
      try {
        // Fetch stats
        if (showStats) {
          const statsData = await getFollowStats({ userId });
          setStats(statsData);
        }

        // Fetch followers and following lists
        const [followersResult, followingResult] = await Promise.all([
          getFollowers({ userId }),
          getFollowing({ userId })
        ]);

        if (followersResult.success) {
          setFollowers(followersResult.data || []);
        }

        if (followingResult.success) {
          setFollowing(followingResult.data || []);
        }
      } catch (error) {
        console.error('Error fetching follow data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, showStats]);

  const getInitials = (email: string, username?: string) => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (email: string, username?: string) => {
    return username || email.split('@')[0];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading follow data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Connections
          {showStats && (
            <div className="flex gap-2 ml-auto">
              <Badge variant="secondary">
                {stats.followersCount} followers
              </Badge>
              <Badge variant="secondary">
                {stats.followingCount} following
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4">
            {followers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No followers yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {followers.map((follow) => (
                  <div
                    key={follow.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(follow.followerEmail, follow.followerUsername)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {getUserDisplayName(follow.followerEmail, follow.followerUsername)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {follow.followerEmail}
                        </p>
                      </div>
                    </div>
                    <FollowButton
                      targetUserId={follow.followerId}
                      targetUserEmail={follow.followerEmail}
                      targetUsername={follow.followerUsername}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            {following.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Not following anyone yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {following.map((follow) => (
                  <div
                    key={follow.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(follow.followedEmail, follow.followedUsername)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {getUserDisplayName(follow.followedEmail, follow.followedUsername)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {follow.followedEmail}
                        </p>
                      </div>
                    </div>
                    <FollowButton
                      targetUserId={follow.followedId}
                      targetUserEmail={follow.followedEmail}
                      targetUsername={follow.followedUsername}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
