'use client';

import { AppLayout } from '@/components/app-layout';
import { BookCard } from '@/components/book-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { getBookRecommendations } from '../actions';
import { 
  getCollaborativeRecommendations, 
  findSimilarUsers, 
  getTrendingAmongSimilarUsers,
  type CollaborativeRecommendation,
  type UserSimilarity 
} from '@/lib/collaborative-filtering';
import { Loader2, Users, Brain, TrendingUp, Star, BookOpen } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

export default function RecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // AI Recommendations
  const [readingHistory, setReadingHistory] = useState('I enjoyed "Dune" for its world-building and political intrigue, and "Project Hail Mary" for its clever problem-solving and humor.');
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Collaborative Filtering
  const [collaborativeRecs, setCollaborativeRecs] = useState<CollaborativeRecommendation[]>([]);
  const [similarUsers, setSimilarUsers] = useState<UserSimilarity[]>([]);
  const [trendingAmongSimilar, setTrendingAmongSimilar] = useState<any[]>([]);
  const [collaborativeLoading, setCollaborativeLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCollaborativeRecommendations();
    }
  }, [user]);

  const fetchCollaborativeRecommendations = async () => {
    if (!user) return;
    
    setCollaborativeLoading(true);
    try {
      const [collabRecs, simUsers, trending] = await Promise.all([
        getCollaborativeRecommendations(user.uid, 12),
        findSimilarUsers(user.uid, 10),
        getTrendingAmongSimilarUsers(user.uid, 8)
      ]);
      
      setCollaborativeRecs(collabRecs);
      setSimilarUsers(simUsers);
      setTrendingAmongSimilar(trending);
    } catch (error) {
      console.error('Error fetching collaborative recommendations:', error);
    } finally {
      setCollaborativeLoading(false);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiError(null);
    setAiRecommendations([]);

    const result = await getBookRecommendations({ readingHistory });

    if (result.success && result.data) {
      setAiRecommendations(result.data.recommendations);
    } else {
      setAiError(result.error || 'An error occurred');
    }
    setAiLoading(false);
  };

  const BookGridSkeleton = ({ count = 8 }: { count?: number }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );

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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Book Recommendations</h1>
            <p className="text-muted-foreground">Discover your next favorite read with AI and community insights</p>
          </div>
        </div>

        <Tabs defaultValue="collaborative" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="collaborative" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Powered
            </TabsTrigger>
          </TabsList>

          {/* Collaborative Filtering Tab */}
          <TabsContent value="collaborative" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Recommended by Similar Readers
                </CardTitle>
                <CardDescription>
                  Books loved by readers with similar taste to yours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collaborativeLoading ? (
                  <BookGridSkeleton count={12} />
                ) : collaborativeRecs.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {collaborativeRecs.map((book) => (
                      <div 
                        key={book.id}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => router.push(`/book/${book.id}`)}
                      >
                        <BookCard book={book} />
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{Math.round(book.recommendationScore * 100)}% match</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{book.reason}</p>
                          {book.averageRating > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              ⭐ {book.averageRating.toFixed(1)}/10
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">No recommendations yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add more books to your library to get personalized recommendations
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Users */}
            {similarUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Readers Like You</CardTitle>
                  <CardDescription>
                    Users with similar reading preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {similarUsers.slice(0, 6).map((user) => (
                      <div key={user.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {user.username || user.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.commonBooks} books in common
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(user.similarityScore * 100)}% match
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trending Among Similar Users Tab */}
          <TabsContent value="trending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Currently Reading
                </CardTitle>
                <CardDescription>
                  Books that readers with similar taste are currently enjoying
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collaborativeLoading ? (
                  <BookGridSkeleton count={8} />
                ) : trendingAmongSimilar.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {trendingAmongSimilar.map((book) => (
                      <div 
                        key={book.id}
                        className="cursor-pointer transition-transform hover:scale-105"
                        onClick={() => router.push(`/book/${book.id}`)}
                      >
                        <BookCard book={book} />
                        <div className="mt-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            📖 Currently reading
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">No trending books found</p>
                    <p className="text-sm text-muted-foreground">
                      Check back when more users with similar taste start reading
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    Your Reading History
                  </CardTitle>
                  <CardDescription>
                    Describe some books or genres you like. The more detail, the better!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAiSubmit} className="space-y-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="reading-history">What have you been reading?</Label>
                      <Textarea
                        placeholder="e.g., I love fantasy novels with complex magic systems like..."
                        id="reading-history"
                        value={readingHistory}
                        onChange={(e) => setReadingHistory(e.target.value)}
                        rows={8}
                      />
                    </div>
                    <Button type="submit" disabled={aiLoading}>
                      {aiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Get AI Recommendations
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Your Next Favorite Books</CardTitle>
                  <CardDescription>
                    Based on your history, here are some books you might love.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {aiLoading && (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {aiError && <p className="text-destructive">{aiError}</p>}
                  {!aiLoading && aiRecommendations.length === 0 && !aiError && (
                    <div className="text-center text-muted-foreground py-16">
                      <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p>Your AI recommendations will appear here.</p>
                    </div>
                  )}
                  {aiRecommendations.length > 0 && (
                    <ul className="space-y-2 list-disc pl-5">
                      {aiRecommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
