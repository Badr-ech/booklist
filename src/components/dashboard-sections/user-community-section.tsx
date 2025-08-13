'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Star, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Review {
  id: string;
  userEmail: string;
  bookTitle: string;
  rating: number;
  content: string;
  createdAt: any;
}

interface Forum {
  id: string;
  title: string;
  category: string;
  postCount: number;
  lastActivity: any;
}

export function UserCommunitySection() {
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [activeForums, setActiveForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recent reviews
    const reviewsQuery = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));
      setRecentReviews(reviews);
    });

    // Fetch active forums
    const forumsQuery = query(
      collection(db, 'forums'),
      orderBy('lastActivity', 'desc'),
      limit(3)
    );

    const unsubscribeForums = onSnapshot(forumsQuery, (snapshot) => {
      const forums = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Forum));
      setActiveForums(forums);
      setLoading(false);
    });

    return () => {
      unsubscribeReviews();
      unsubscribeForums();
    };
  }, []);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Recently';
  };

  return (
    <section className="w-full py-8">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-headline">
              Community Activity
            </h2>
            <p className="text-muted-foreground mt-2">
              Connect with fellow book lovers
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/forums">Join Discussions</Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Reviews */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">Recent Reviews</h3>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <div className="h-8 w-8 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentReviews.length > 0 ? (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {review.userEmail?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium truncate">
                              {review.userEmail?.split('@')[0] || 'Anonymous'}
                            </p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${
                                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{review.bookTitle}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {review.content || 'No review content'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimeAgo(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No recent reviews yet.</p>
                  <Button asChild variant="ghost" className="mt-2">
                    <Link href="/dashboard">Add your first review</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/reviews">View All Reviews</Link>
            </Button>
          </div>

          {/* Forum Activity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Forum Activity</h3>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeForums.length > 0 ? (
              <div className="space-y-4">
                {activeForums.map((forum) => (
                  <Card key={forum.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2 text-sm">{forum.title}</h4>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">{forum.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {forum.postCount || 0} posts
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(forum.lastActivity)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No active forums yet.</p>
                  <Button asChild variant="ghost" className="mt-2">
                    <Link href="/forums">Start a discussion</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/forums">View All Forums</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
