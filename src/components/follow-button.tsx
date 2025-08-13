'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser, isFollowing } from '@/app/actions';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  targetUserEmail: string;
  targetUsername?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function FollowButton({
  targetUserId,
  targetUserEmail,
  targetUsername,
  className,
  variant = 'default',
  size = 'default'
}: FollowButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if currently following the user
  useEffect(() => {
    async function checkFollowStatus() {
      if (!user?.uid || !targetUserId || user.uid === targetUserId) {
        setChecking(false);
        return;
      }

      try {
        const result = await isFollowing({
          followerId: user.uid,
          followedId: targetUserId
        });
        setIsFollowingUser(result.isFollowing);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setChecking(false);
      }
    }

    checkFollowStatus();
  }, [user?.uid, targetUserId]);

  const handleFollow = async () => {
    if (!user?.uid || !user?.email) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to follow users.',
        variant: 'destructive',
      });
      return;
    }

    if (user.uid === targetUserId) {
      toast({
        title: 'Invalid Action',
        description: 'You cannot follow yourself.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isFollowingUser) {
        const result = await unfollowUser({
          followerId: user.uid,
          followedId: targetUserId
        });

        if (result.success) {
          setIsFollowingUser(false);
          toast({
            title: 'Unfollowed',
            description: `You are no longer following ${targetUsername || targetUserEmail}.`,
          });
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to unfollow user.',
            variant: 'destructive',
          });
        }
      } else {
        const result = await followUser({
          followerId: user.uid,
          followedId: targetUserId,
          followerEmail: user.email,
          followedEmail: targetUserEmail,
          followerUsername: user.displayName || undefined,
          followedUsername: targetUsername
        });

        if (result.success) {
          setIsFollowingUser(true);
          toast({
            title: 'Following',
            description: `You are now following ${targetUsername || targetUserEmail}.`,
          });
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to follow user.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error in follow action:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button for self
  if (!user?.uid || user.uid === targetUserId) {
    return null;
  }

  if (checking) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowingUser ? 'outline' : variant}
      size={size}
      onClick={handleFollow}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isFollowingUser ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Processing...' : isFollowingUser ? 'Unfollow' : 'Follow'}
    </Button>
  );
}
