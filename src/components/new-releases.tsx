"use client";

import { useState, useEffect } from 'react';
import { Calendar, Star, TrendingUp, Filter, Search } from 'lucide-react';
import { BookSearchResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MOCK_BOOKS } from '@/lib/mock-books';
import { googleBooksService } from '@/lib/google-books-service';

export function NewReleases() {
  const { toast } = useToast();
  const [books, setBooks] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('month');

  useEffect(() => {
    loadNewReleases();
  }, [timeframe, selectedGenre]);

  const loadNewReleases = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on timeframe
      const now = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      // Build search query for new releases
      let query = `newest:${formatDate(startDate)}..${formatDate(now)}`;
      
      if (searchQuery.trim()) {
        query += `+${encodeURIComponent(searchQuery.trim())}`;
      }

      const filters = {
        genre: selectedGenre === 'all' ? 'All Genres' : selectedGenre,
        sortBy: 'newest' as const
      };

      const results = await googleBooksService.searchBooks(query, filters);
      
      // Filter and process results for recent books
      const processedBooks = results
        .filter((item: any) => {
          // Filter out books without essential information
          return (
            item.title &&
            item.author &&
            item.publishedDate &&
            item.coverImage
          );
        })
        .slice(0, 40); // Limit to 40 results

      setBooks(processedBooks);
    } catch (error) {
      console.error('Error loading new releases:', error);
      
      // Fallback to mock data for new releases
      const mockNewReleases = MOCK_BOOKS.filter(book => {
        const bookYear = new Date(book.publishedDate).getFullYear();
        const currentYear = new Date().getFullYear();
        return bookYear >= currentYear - 2; // Recent books
      });
      setBooks(mockNewReleases);
      
      toast({
        title: "Notice",
        description: "Using sample data. Service will use real data when API is available.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const genres = [
    'Fiction', 'Mystery', 'Romance', 'Thriller', 'Science Fiction', 
    'Fantasy', 'Biography', 'History', 'Self Help', 'Business',
    'Philosophy', 'Psychology', 'Health', 'Cooking', 'Travel'
  ];

  const filteredBooks = books.filter(book => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const groupedBooks = {
    thisWeek: filteredBooks.filter(book => {
      const publishDate = new Date(book.publishedDate || '');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return publishDate >= weekAgo;
    }),
    thisMonth: filteredBooks.filter(book => {
      const publishDate = new Date(book.publishedDate || '');
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return publishDate >= monthAgo;
    }),
    recent: filteredBooks
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">New Releases</h2>
          <p className="text-muted-foreground">Discover the latest books across all genres</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search new releases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map(genre => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={loadNewReleases} variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Content */}
      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="thisWeek" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            This Week ({groupedBooks.thisWeek.length})
          </TabsTrigger>
          <TabsTrigger value="thisMonth" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            This Month ({groupedBooks.thisMonth.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            All Recent ({groupedBooks.recent.length})
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="text-center p-8">Loading new releases...</div>
        ) : (
          <>
            <TabsContent value="thisWeek">
              <BookGrid books={groupedBooks.thisWeek} emptyMessage="No new releases this week" />
            </TabsContent>
            <TabsContent value="thisMonth">
              <BookGrid books={groupedBooks.thisMonth} emptyMessage="No new releases this month" />
            </TabsContent>
            <TabsContent value="recent">
              <BookGrid books={groupedBooks.recent} emptyMessage="No new releases found" />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

interface BookGridProps {
  books: BookSearchResult[];
  emptyMessage: string;
}

function BookGrid({ books, emptyMessage }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {books.map(book => (
        <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-[3/4] relative">
            <img 
              src={book.coverImage} 
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold line-clamp-2 text-sm">{book.title}</h3>
            <p className="text-xs text-muted-foreground">by {book.author}</p>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-xs">
                {book.genre}
              </Badge>
              {book.averageRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{book.averageRating}</span>
                </div>
              )}
            </div>
            {book.publishedDate && (
              <p className="text-xs text-muted-foreground">
                Published: {new Date(book.publishedDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
