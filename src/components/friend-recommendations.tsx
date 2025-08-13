"use client";

import { useState, useEffect } from 'react';
import { Users, Star, Book, Heart, Plus } from 'lucide-react';
import { useAuth } from './auth-provider';
import { Book as BookType } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { getFriendRecommendations, getFollowing, addBookToList } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface FriendRecommendation {
  book: BookType;
  recommendedBy: {
    userId: string;
    email: string;
    rating?: number;
    review?: string;
  }[];
  averageRating: number;
  totalRecommendations: number;
}

interface PopularWithFriends {
  book: BookType;
  friendCount: number;
  friends: string[];
  averageRating: number;
}

export function FriendRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<FriendRecommendation[]>([]);
  const [popularBooks, setPopularBooks] = useState<PopularWithFriends[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadFriendRecommendations();
    }
  }, [user]);

  const loadFriendRecommendations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get list of people user follows
      const followingResult = await getFollowing({ userId: user.uid });
      if (!followingResult.success || !followingResult.data) {
        setLoading(false);
        return;
      }
      
      const following = followingResult.data;
      setFollowingCount(following.length);
      
      if (following.length === 0) {
        setLoading(false);
        return;
      }

      // Get friend recommendations
      const friendRecs = await getFriendRecommendations(user.uid);
      setRecommendations(friendRecs.slice(0, 20)); // Limit to top 20
      
      // Create popular books data
      const popular = generatePopularWithFriends(friendRecs, following);
      setPopularBooks(popular.slice(0, 10));
      
    } catch (error) {
      console.error('Error loading friend recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load friend recommendations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePopularWithFriends = (recs: FriendRecommendation[], following: any[]): PopularWithFriends[] => {
    // Group books by how many friends have them
    const bookPopularity = recs.reduce((acc, rec) => {
      const bookId = rec.book.id;
      if (!acc[bookId]) {
        acc[bookId] = {
          book: rec.book,
          friendCount: 0,
          friends: [],
          totalRating: 0,
          ratingCount: 0
        };
      }
      acc[bookId].friendCount += rec.totalRecommendations;
      acc[bookId].friends.push(...rec.recommendedBy.map(r => r.email));
      acc[bookId].totalRating += rec.averageRating * rec.totalRecommendations;
      acc[bookId].ratingCount += rec.totalRecommendations;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(bookPopularity)
      .map((item: any) => ({
        book: item.book,
        friendCount: item.friendCount,
        friends: [...new Set(item.friends)] as string[], // Remove duplicates and cast to string[]
        averageRating: item.ratingCount > 0 ? item.totalRating / item.ratingCount : 0
      }))
      .sort((a, b) => b.friendCount - a.friendCount);
  };

  const handleAddBook = async (book: BookType) => {
    if (!user) return;

    try {
      await addBookToList({ 
        userId: user.uid, 
        book: { ...book, status: 'plan-to-read' as const }
      });
      
      toast({
        title: "Success",
        description: `Added "${book.title}" to your reading list`
      });
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: "Error",
        description: "Failed to add book to your list",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <p>Please log in to see friend recommendations.</p>
      </div>
    );
  }

  if (followingCount === 0) {
    return (
      <div className="text-center p-8 space-y-4">
        <Users className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
        <div>
          <h3 className="text-lg font-semibold">No Friends Yet</h3>
          <p className="text-muted-foreground">
            Start following other readers to get personalized book recommendations from friends!
          </p>
        </div>
        <Button onClick={() => window.location.href = '/discover'}>
          Discover Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Friend Recommendations</h2>
          <p className="text-muted-foreground">
            Discover books loved by the {followingCount} readers you follow
          </p>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Recommended For You
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Popular With Friends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {loading ? (
            <div className="text-center p-8">Loading recommendations...</div>
          ) : recommendations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No recommendations available yet.</p>
              <p className="text-sm">Your friends need to rate more books to get recommendations!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((rec, index) => (
                <Card key={rec.book.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img 
                        src={rec.book.coverImage} 
                        alt={rec.book.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{rec.book.title}</h3>
                            <p className="text-muted-foreground">by {rec.book.author}</p>
                            <Badge variant="secondary" className="mt-1">
                              {rec.book.genre}
                            </Badge>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{rec.averageRating.toFixed(1)}</span>
                            </div>
                            <Button onClick={() => handleAddBook(rec.book)} size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Add to List
                            </Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Recommended by {rec.totalRecommendations} friend{rec.totalRecommendations > 1 ? 's' : ''}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {rec.recommendedBy.slice(0, 3).map((friend, i) => (
                              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {friend.email.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{friend.email.split('@')[0]}</span>
                                {friend.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs">{friend.rating}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {rec.recommendedBy.length > 3 && (
                              <Badge variant="outline">
                                +{rec.recommendedBy.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {rec.book.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {rec.book.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          {loading ? (
            <div className="text-center p-8">Loading popular books...</div>
          ) : popularBooks.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No popular books yet.</p>
              <p className="text-sm">Your friends need to add more books!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {popularBooks.map((popular, index) => (
                <Card key={popular.book.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={popular.book.coverImage} 
                        alt={popular.book.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{popular.book.title}</h4>
                            <p className="text-sm text-muted-foreground">by {popular.book.author}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium">{popular.friendCount}</span>
                            </div>
                            {popular.averageRating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{popular.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                            <Button onClick={() => handleAddBook(popular.book)} size="sm" variant="outline">
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            Popular with: {popular.friends.slice(0, 2).map(f => f.split('@')[0]).join(', ')}
                            {popular.friends.length > 2 && ` +${popular.friends.length - 2} more`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
