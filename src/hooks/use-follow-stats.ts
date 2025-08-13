'use client';

import { useState, useEffect } from 'react';
import { getFollowStats, isFollowing } from '@/app/actions';
import { FollowStats } from '@/lib/types';

export function useFollowStats(userId: string | null) {
  const [stats, setStats] = useState<FollowStats>({ 
    followersCount: 0, 
    followingCount: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getFollowStats({ userId });
      setStats(result);
    } catch (err) {
      console.error('Error fetching follow stats:', err);
      setError('Failed to load follow statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, [userId]);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
}

export function useIsFollowing(currentUserId: string | null, targetUserId: string | null) {
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkFollowStatus = async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await isFollowing({
        followerId: currentUserId,
        followedId: targetUserId
      });
      setIsFollowingUser(result.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
      setIsFollowingUser(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFollowStatus();
  }, [currentUserId, targetUserId]);

  return {
    isFollowing: isFollowingUser,
    loading,
    refreshFollowStatus: checkFollowStatus
  };
}
