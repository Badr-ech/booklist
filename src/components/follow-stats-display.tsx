'use client';

import { useFollowStats } from '@/hooks/use-follow-stats';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FollowStatsDisplayProps {
  userId: string;
  className?: string;
  showIcons?: boolean;
  variant?: 'default' | 'secondary' | 'outline';
}

export function FollowStatsDisplay({
  userId,
  className,
  showIcons = true,
  variant = 'secondary'
}: FollowStatsDisplayProps) {
  const { stats, loading, error } = useFollowStats(userId);

  if (loading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Badge variant={variant} className="flex items-center gap-1">
        {showIcons && <Users className="h-3 w-3" />}
        {stats.followersCount} follower{stats.followersCount !== 1 ? 's' : ''}
      </Badge>
      <Badge variant={variant} className="flex items-center gap-1">
        {showIcons && <UserPlus className="h-3 w-3" />}
        {stats.followingCount} following
      </Badge>
    </div>
  );
}
