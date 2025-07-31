'use client';

import { AppLayout } from '@/components/app-layout';
import { BookCard } from '@/components/book-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { BookSearchResult, BookClient, BookSearchFilters } from '@/lib/types';
import { PlusCircle, Search as SearchIcon, Loader2, Filter, SortAsc, SortDesc, Grid, List, Star } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { AddBookModal } from '@/components/add-book-modal';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const GENRES = [
  'All Genres', 'Fiction', 'Fantasy', 'Romance', 'Science Fiction', 'Mystery', 
  'Thriller', 'Horror', 'Young Adult', 'Historical Fiction', 'Biography', 
  'Non-fiction', 'Self-Help', 'Business', 'Poetry', 'Drama'
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'author', label: 'Author A-Z' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' }
];

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const [filters, setFilters] = useState<BookSearchFilters>({
    genre: 'All Genres',
    status: 'all',
    rating: 'all',
    year: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const [yearRange, setYearRange] = useState([1900, 2024]);
  const [ratingRange, setRatingRange] = useState([0, 5]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults([]);
      setFilteredResults([]);
      setLoading(false);
      return;
    }

    const fetchBooks = async () => {
      setLoading(true);
      try {
        // Build query based on filters
        let query = debouncedSearchTerm;
        if (filters.genre !== 'All Genres') {
          query += `+subject:${filters.genre}`;
        }

        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&orderBy=${filters.sortBy === 'relevance' ? 'relevance' : 'newest'}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
        );
        const data = await response.json();
        
        const items: BookSearchResult[] = data.items?.map((item: any) => {
          const publishedDate = item.volumeInfo.publishedDate;
          const year = publishedDate ? new Date(publishedDate).getFullYear() : null;
          
          return {
            id: item.id,
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors?.[0] || 'Unknown Author',
            coverImage: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://placehold.co/300x450.png',
            description: item.volumeInfo.description,
            genre: item.volumeInfo.categories?.[0] || 'Uncategorized',
            status: 'plan-to-read',
            publishedDate: publishedDate,
            averageRating: item.volumeInfo.averageRating || 0,
            ratingsCount: item.volumeInfo.ratingsCount || 0,
            pageCount: item.volumeInfo.pageCount,
            publisher: item.volumeInfo.publisher,
            language: item.volumeInfo.language || 'en'
          };
        }) || [];
        
        setSearchResults(items);
      } catch (error) {
        console.error('Error fetching books:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch books from Google Books API.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBooks();
    }
  }, [debouncedSearchTerm, filters.genre, toast, user]);

  // Apply filters and sorting
  const applyFiltersAndSort = useMemo(() => {
    let filtered = [...searchResults];

    // Apply year filter
    if (filters.year !== 'all') {
      if (filters.year === 'recent') {
        filtered = filtered.filter(book => {
          const year = book.publishedDate ? new Date(book.publishedDate).getFullYear() : 0;
          return year >= 2020;
        });
      } else if (filters.year === 'classic') {
        filtered = filtered.filter(book => {
          const year = book.publishedDate ? new Date(book.publishedDate).getFullYear() : 0;
          return year < 2000;
        });
      } else if (filters.year === 'range') {
        filtered = filtered.filter(book => {
          const year = book.publishedDate ? new Date(book.publishedDate).getFullYear() : 0;
          return year >= yearRange[0] && year <= yearRange[1];
        });
      }
    }

    // Apply rating filter
    if (filters.rating !== 'all') {
      if (filters.rating === 'high') {
        filtered = filtered.filter(book => (book.averageRating || 0) >= 4);
      } else if (filters.rating === 'range') {
        filtered = filtered.filter(book => {
          const rating = book.averageRating || 0;
          return rating >= ratingRange[0] && rating <= ratingRange[1];
        });
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        filtered.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.ratingsCount || 0) - (a.ratingsCount || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const yearA = a.publishedDate ? new Date(a.publishedDate).getFullYear() : 0;
          const yearB = b.publishedDate ? new Date(b.publishedDate).getFullYear() : 0;
          return yearB - yearA;
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const yearA = a.publishedDate ? new Date(a.publishedDate).getFullYear() : 0;
          const yearB = b.publishedDate ? new Date(b.publishedDate).getFullYear() : 0;
          return yearA - yearB;
        });
        break;
    }

    if (filters.sortOrder === 'asc' && ['title', 'author'].includes(filters.sortBy)) {
      // Already sorted ascending for title/author
    } else if (filters.sortOrder === 'desc' && ['title', 'author'].includes(filters.sortBy)) {
      filtered.reverse();
    }

    return filtered;
  }, [searchResults, filters, yearRange, ratingRange]);

  useEffect(() => {
    setFilteredResults(applyFiltersAndSort);
  }, [applyFiltersAndSort]);

  const handleOpenModal = (book: BookSearchResult) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
    setIsModalOpen(false);
  };

  const handleAddBook = async (details: BookClient) => {
    if (!selectedBook || !user) return;

    const bookToAdd = {
      id: selectedBook.id,
      title: selectedBook.title,
      author: selectedBook.author,
      coverImage: selectedBook.coverImage,
      description: selectedBook.description,
      genre: selectedBook.genre,
      status: details.status,
      rating: details.rating,
      startDate: details.startDate,
      endDate: details.endDate,
    };
    
    try {
      const bookRef = doc(db, 'users', user.uid, 'books', bookToAdd.id);
      
      const bookData: any = {
        id: bookToAdd.id,
        title: bookToAdd.title,
        author: bookToAdd.author,
        coverImage: bookToAdd.coverImage,
        status: bookToAdd.status,
        genre: bookToAdd.genre,
        description: bookToAdd.description || null,
        dateAdded: serverTimestamp(),
      };
      
      if (typeof bookToAdd.rating === 'number' && !isNaN(bookToAdd.rating)) {
          bookData.rating = bookToAdd.rating;
      }
      
      if (bookToAdd.startDate) {
          if (bookToAdd.startDate instanceof Date) {
              bookData.startDate = Timestamp.fromDate(bookToAdd.startDate);
          } else if (typeof bookToAdd.startDate === 'string') {
              bookData.startDate = Timestamp.fromDate(new Date(bookToAdd.startDate));
          } else {
              bookData.startDate = bookToAdd.startDate;
          }
      }
      
      if (bookToAdd.endDate) {
          if (bookToAdd.endDate instanceof Date) {
              bookData.endDate = Timestamp.fromDate(bookToAdd.endDate);
          } else if (typeof bookToAdd.endDate === 'string') {
              bookData.endDate = Timestamp.fromDate(new Date(bookToAdd.endDate));
          } else {
              bookData.endDate = bookToAdd.endDate;
          }
      }

      await setDoc(bookRef, bookData, { merge: true });
      
      toast({
        title: 'Book Added!',
        description: `"${bookToAdd.title}" has been added to your list.`,
      });
      handleCloseModal();
    } catch (error: any) {
      console.error('Error adding book:', error);
      toast({
        title: 'Error',
        description: `Failed to add book: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      genre: 'All Genres',
      status: 'all',
      rating: 'all',
      year: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    setYearRange([1900, 2024]);
    setRatingRange([0, 5]);
  };

  if (authLoading || !user) {
      return (
          <AppLayout>
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
          </AppLayout>
      )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Advanced Search</h2>
            <p className="text-muted-foreground">Discover books with powerful filtering and sorting options</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or keywords..."
            className="pl-10 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Search Filters</span>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Genre Filter */}
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Select 
                    value={filters.genre} 
                    onValueChange={(value) => setFilters(prev => ({...prev, genre: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Filter */}
                <div className="space-y-2">
                  <Label>Publication Year</Label>
                  <Select 
                    value={filters.year} 
                    onValueChange={(value) => setFilters(prev => ({...prev, year: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="recent">Recent (2020+)</SelectItem>
                      <SelectItem value="classic">Classic (Pre-2000)</SelectItem>
                      <SelectItem value="range">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Select 
                    value={filters.rating} 
                    onValueChange={(value) => setFilters(prev => ({...prev, rating: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="high">High Rated (4.0+)</SelectItem>
                      <SelectItem value="range">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => setFilters(prev => ({...prev, sortBy: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Year Range */}
              {filters.year === 'range' && (
                <div className="space-y-2">
                  <Label>Year Range: {yearRange[0]} - {yearRange[1]}</Label>
                  <Slider
                    value={yearRange}
                    onValueChange={setYearRange}
                    min={1800}
                    max={2024}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* Custom Rating Range */}
              {filters.rating === 'range' && (
                <div className="space-y-2">
                  <Label>Rating Range: {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)}</Label>
                  <Slider
                    value={ratingRange}
                    onValueChange={setRatingRange}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        <div>
          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && filteredResults.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} 
                  {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(prev => ({
                      ...prev, 
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                    }))}
                  >
                    {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
                  {filteredResults.map((book) => (
                    <div key={book.id} className="relative group w-full max-w-[150px] flex flex-col">
                      <BookCard 
                        book={book} 
                        className="flex-1 cursor-pointer" 
                        onClick={() => router.push(`/book/${book.id}`)}
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(book);
                        }}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span className="sr-only">Add to list</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map((book) => (
                    <Card key={book.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-16 h-24 object-cover rounded flex-shrink-0"
                            onClick={() => router.push(`/book/${book.id}`)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 mr-4">
                                <h4 
                                  className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer truncate"
                                  onClick={() => router.push(`/book/${book.id}`)}
                                >
                                  {book.title}
                                </h4>
                                <p className="text-muted-foreground mb-2">{book.author}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <Badge variant="secondary">{book.genre}</Badge>
                                  {book.publishedDate && (
                                    <span>{new Date(book.publishedDate).getFullYear()}</span>
                                  )}
                                  {book.averageRating && book.averageRating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span>{book.averageRating.toFixed(1)}</span>
                                      {book.ratingsCount && book.ratingsCount > 0 && (
                                        <span className="text-xs">({book.ratingsCount})</span>
                                      )}
                                    </div>
                                  )}
                                  {book.pageCount && <span>{book.pageCount} pages</span>}
                                </div>
                                {book.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {book.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal(book);
                                }}
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && debouncedSearchTerm && filteredResults.length === 0 && searchResults.length > 0 && (
            <div className="text-center text-muted-foreground py-16">
              <p>No books match your current filters.</p>
              <Button variant="link" onClick={resetFilters}>Reset filters to see all results</Button>
            </div>
          )}

          {!loading && debouncedSearchTerm && searchResults.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              <p>No books found matching your search.</p>
              <p className="text-sm">Try different keywords or check your spelling.</p>
            </div>
          )}

          {!loading && !debouncedSearchTerm && (
            <div className="text-center text-muted-foreground py-16">
              <p>Start typing to search for books with advanced filtering options.</p>
            </div>
          )}
        </div>
      </div>

      {selectedBook && (
        <AddBookModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          book={selectedBook}
          onAddBook={handleAddBook}
        />
      )}
    </AppLayout>
  );
}
