import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getFollowingActivities, getUserActivities } from '@/lib/activity';
import { UserActivity } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { 
  BookOpen, 
  Star, 
  MessageSquare, 
  Target, 
  Clock,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ActivityFeedProps {
  showOwnActivities?: boolean;
  limitCount?: number;
  className?: string;
}

export function ActivityFeed({ showOwnActivities = false, limitCount = 20, className }: ActivityFeedProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [ownActivities, setOwnActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let unsubscribeFollowing: (() => void) | undefined;
    let unsubscribeOwn: (() => void) | undefined;

    // Subscribe to following activities
    unsubscribeFollowing = getFollowingActivities(user.uid, limitCount, (data) => {
      setActivities(data);
      setLoading(false);
    });

    // Subscribe to own activities if requested
    if (showOwnActivities) {
      unsubscribeOwn = getUserActivities(user.uid, limitCount, (data) => {
        setOwnActivities(data);
      });
    }

    return () => {
      unsubscribeFollowing?.();
      unsubscribeOwn?.();
    };
  }, [user, limitCount, showOwnActivities]);

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'book_added':
        return <BookOpen className="h-4 w-4" />;
      case 'book_completed':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'review_posted':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'rating_given':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'goal_updated':
        return <Target className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: UserActivity) => {
    switch (activity.type) {
      case 'book_added':
        return `added "${activity.bookTitle}" to their list`;
      case 'book_completed':
        return activity.rating 
          ? `completed "${activity.bookTitle}" and rated it ${activity.rating}/10`
          : `completed "${activity.bookTitle}"`;
      case 'review_posted':
        return `reviewed "${activity.bookTitle}"`;
      case 'rating_given':
        return `rated "${activity.bookTitle}" ${activity.rating}/10`;
      case 'goal_updated':
        return 'updated their reading goal';
      default:
        return 'had some activity';
    }
  };

  const getActivityBadgeColor = (type: UserActivity['type']) => {
    switch (type) {
      case 'book_added':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'book_completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'review_posted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'rating_given':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'goal_updated':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: Timestamp) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const ActivityItem = ({ activity }: { activity: UserActivity }) => (
    <div className="flex items-start gap-3 p-4 hover:bg-muted/50 rounded-lg transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {activity.userId.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-2 flex-1">
            {getActivityIcon(activity.type)}
            <span className="text-sm">
              <span className="font-medium">User</span> {getActivityText(activity)}
            </span>
          </div>
          <Badge variant="secondary" className={`text-xs ${getActivityBadgeColor(activity.type)}`}>
            {activity.type.replace('_', ' ')}
          </Badge>
        </div>

        {activity.bookId && activity.bookCover && (
          <Link href={`/book/${activity.bookId}`} className="block">
            <div className="flex items-center gap-3 p-2 bg-background border rounded-md hover:bg-muted/50 transition-colors">
              <Image
                src={activity.bookCover}
                alt={activity.bookTitle || 'Book cover'}
                width={40}
                height={60}
                className="rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-sm line-clamp-1">{activity.bookTitle}</p>
                {activity.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{activity.rating}/10</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}

        {activity.reviewText && (
          <div className="text-sm text-muted-foreground italic bg-muted/30 p-2 rounded">
            "{activity.reviewText}..."
          </div>
        )}

        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTimeAgo(activity.timestamp)}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const content = showOwnActivities ? (
    <Tabs defaultValue="following" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="following">Following</TabsTrigger>
        <TabsTrigger value="your-activity">Your Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="following" className="space-y-4 mt-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity from people you follow.</p>
            <p className="text-sm">Follow some users to see their reading activity here!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <div key={activity.id}>
                <ActivityItem activity={activity} />
                {index < activities.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="your-activity" className="space-y-4 mt-4">
        {ownActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity.</p>
            <p className="text-sm">Start reading and rating books to see your activity here!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {ownActivities.map((activity, index) => (
              <div key={activity.id}>
                <ActivityItem activity={activity} />
                {index < ownActivities.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  ) : (
    <div className="space-y-1">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No recent activity from people you follow.</p>
          <p className="text-sm">Follow some users to see their reading activity here!</p>
        </div>
      ) : (
        activities.map((activity, index) => (
          <div key={activity.id}>
            <ActivityItem activity={activity} />
            {index < activities.length - 1 && <Separator className="my-2" />}
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
}
