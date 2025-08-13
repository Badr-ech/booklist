'use client';

import { AppLayout } from '@/components/app-layout';
import { BookCard } from '@/components/book-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getTrendingBooks, getPopularBooksByGenre, type TrendingBook } from '@/lib/trending';
import { TrendingUp, Flame, Star, Users, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const genres = [
  'Fiction',
  'Non-Fiction',
  'Sci-Fi',
  'Fantasy',
  'Romance',
  'Mystery',
  'Thriller',
  'Historical Fiction',
  'Biography',
  'Self-Help',
  'Contemporary Fiction',
  'Classic',
  'Young Adult',
];

export default function TrendingPage() {
  const [trendingBooks, setTrendingBooks] = useState<TrendingBook[]>([]);
  const [popularBooks, setPopularBooks] = useState<TrendingBook[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('Fiction');
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingBooks = async () => {
      try {
        const trending = await getTrendingBooks(20);
        setTrendingBooks(trending);
      } catch (error) {
        console.error('Error fetching trending books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingBooks();
  }, []);

  useEffect(() => {
    const fetchPopularByGenre = async () => {
      if (!selectedGenre) return;
      
      setGenreLoading(true);
      try {
        const popular = await getPopularBooksByGenre(selectedGenre, 12);
        setPopularBooks(popular);
      } catch (error) {
        console.error('Error fetching popular books by genre:', error);
      } finally {
        setGenreLoading(false);
      }
    };

    fetchPopularByGenre();
  }, [selectedGenre]);

  const BookGrid = ({ books, isLoading = false }: { books: TrendingBook[]; isLoading?: boolean }) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (books.length === 0) {
      return (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No trending books found</p>
          <p className="text-sm text-muted-foreground">Check back later for trending content</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {books.map((book, index) => (
          <div 
            key={book.id}
            className="relative cursor-pointer transition-transform hover:scale-105"
            onClick={() => router.push(`/book/${book.id}`)}
          >
            {index < 3 && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
              >
                #{index + 1}
              </Badge>
            )}
            <BookCard book={book} />
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="w-3 h-3 text-orange-500" />
                <span>{Math.round(book.trendingScore)} trending score</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{book.totalUsers} readers</span>
              </div>
              {book.averageRating > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>{book.averageRating.toFixed(1)}/10</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trending Books</h1>
            <p className="text-muted-foreground">Discover what the community is reading</p>
          </div>
        </div>

        <Tabs defaultValue="trending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Hot This Week
            </TabsTrigger>
            <TabsTrigger value="genre" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              By Genre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Trending Now
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Books with the highest activity and engagement this week
                </p>
              </CardHeader>
              <CardContent>
                <BookGrid books={trendingBooks} isLoading={loading} />
              </CardContent>
            </Card>

            {/* Weekly Highlights */}
            {trendingBooks.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">📈 Rising Star</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trendingBooks[0] && (
                      <div 
                        className="cursor-pointer"
                        onClick={() => router.push(`/book/${trendingBooks[0].id}`)}
                      >
                        <BookCard book={trendingBooks[0]} />
                        <div className="mt-3">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            +{trendingBooks[0].weeklyAdditions} this week
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">⭐ Highest Rated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trendingBooks
                      .filter(book => book.averageRating > 0)
                      .sort((a, b) => b.averageRating - a.averageRating)[0] && (
                      <div 
                        className="cursor-pointer"
                        onClick={() => router.push(`/book/${trendingBooks.filter(book => book.averageRating > 0).sort((a, b) => b.averageRating - a.averageRating)[0].id}`)}
                      >
                        <BookCard book={trendingBooks.filter(book => book.averageRating > 0).sort((a, b) => b.averageRating - a.averageRating)[0]} />
                        <div className="mt-3">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            ⭐ {trendingBooks.filter(book => book.averageRating > 0).sort((a, b) => b.averageRating - a.averageRating)[0].averageRating.toFixed(1)}/10
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">👥 Most Popular</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trendingBooks
                      .sort((a, b) => b.totalUsers - a.totalUsers)[0] && (
                      <div 
                        className="cursor-pointer"
                        onClick={() => router.push(`/book/${trendingBooks.sort((a, b) => b.totalUsers - a.totalUsers)[0].id}`)}
                      >
                        <BookCard book={trendingBooks.sort((a, b) => b.totalUsers - a.totalUsers)[0]} />
                        <div className="mt-3">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            👥 {trendingBooks.sort((a, b) => b.totalUsers - a.totalUsers)[0].totalUsers} readers
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="genre" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Popular by Genre
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Most popular books in each genre
                    </p>
                  </div>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <BookGrid books={popularBooks} isLoading={genreLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
