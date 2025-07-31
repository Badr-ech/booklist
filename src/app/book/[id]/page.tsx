'use client';

import { AppLayout } from '@/components/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Book, BookReview, BookStats } from '@/lib/types';
import { Star, BookOpen, Users, MessageSquare, Plus, Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  getDocs,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import Image from 'next/image';
import { AddBookModal } from '@/components/add-book-modal';
import type { BookClient } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BookCard } from '@/components/book-card';

interface BookDetailsPageProps {
  params: {
    id: string;
  };
}

export default function BookDetailsPage({ params }: BookDetailsPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [book, setBook] = useState<Book | null>(null);
  const [bookStats, setBookStats] = useState<BookStats | null>(null);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [userBook, setUserBook] = useState<Book | null>(null);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!params.id) return;
      
      setLoading(true);
      try {
        // First try to get from Google Books API
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${params.id}?key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
        );
        const data = await response.json();
        
        if (data.error) {
          throw new Error('Book not found');
        }

        const bookData: Book = {
          id: data.id,
          title: data.volumeInfo.title,
          author: data.volumeInfo.authors?.[0] || 'Unknown Author',
          coverImage: data.volumeInfo.imageLinks?.thumbnail || 'https://placehold.co/300x450.png',
          description: data.volumeInfo.description,
          genre: data.volumeInfo.categories?.[0] || 'Uncategorized',
          status: 'plan-to-read',
        };

        setBook(bookData);

        // Get user's copy of this book if it exists
        if (user) {
          const userBookRef = doc(db, 'users', user.uid, 'books', params.id);
          const userBookSnap = await getDoc(userBookRef);
          if (userBookSnap.exists()) {
            setUserBook({ id: userBookSnap.id, ...userBookSnap.data() } as Book);
          }
        }

        // Get book statistics
        await fetchBookStats();
        
        // Get reviews
        await fetchReviews();
        
        // Get similar books
        await fetchSimilarBooks(bookData.genre, bookData.title);

      } catch (error) {
        console.error('Error fetching book details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load book details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [params.id, user, toast]);

  const fetchBookStats = async () => {
    try {
      const statsRef = doc(db, 'bookStats', params.id);
      const statsSnap = await getDoc(statsRef);
      
      if (statsSnap.exists()) {
        setBookStats(statsSnap.data() as BookStats);
      } else {
        // Initialize stats if they don't exist
        const initialStats: BookStats = {
          averageRating: 0,
          totalRatings: 0,
          totalReviews: 0,
          statusCounts: {
            'plan-to-read': 0,
            'reading': 0,
            'completed': 0,
            'on-hold': 0,
            'dropped': 0,
          },
        };
        setBookStats(initialStats);
      }
    } catch (error) {
      console.error('Error fetching book stats:', error);
    }
  };

  const fetchReviews = () => {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef, 
      where('bookId', '==', params.id),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const reviewsData: BookReview[] = [];
      snapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() } as BookReview);
      });
      setReviews(reviewsData);
    });
  };

  const fetchSimilarBooks = async (genre: string, title?: string) => {
    try {
      const similarBooks: Book[] = [];
      
      // Strategy 1: Search by keywords extracted from title and description
      const searchKeywords = extractKeywords(title || '', book?.description || '');
      if (searchKeywords.length > 0) {
        for (const keyword of searchKeywords.slice(0, 3)) { // Try top 3 keywords
          const keywordResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q="${encodeURIComponent(keyword)}"&orderBy=relevance&maxResults=6&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
          );
          const keywordData = await keywordResponse.json();
          if (keywordData.items) {
            const keywordBooks = keywordData.items.map((item: any) => ({
              id: item.id,
              title: item.volumeInfo.title,
              author: item.volumeInfo.authors?.[0] || 'Unknown Author',
              coverImage: item.volumeInfo.imageLinks?.thumbnail || 'https://placehold.co/300x450.png',
              description: item.volumeInfo.description,
              genre: item.volumeInfo.categories?.[0] || genre,
              status: 'plan-to-read',
            }));
            similarBooks.push(...keywordBooks);
          }
        }
      }

      // Strategy 2: Genre-specific search with better terms
      if (genre && genre !== 'Uncategorized') {
        const genreKeywords = getGenreSpecificTerms(genre);
        for (const term of genreKeywords) {
          const genreResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(term)}&orderBy=relevance&maxResults=6&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
          );
          const genreData = await genreResponse.json();
          if (genreData.items) {
            const genreBooks = genreData.items.map((item: any) => ({
              id: item.id,
              title: item.volumeInfo.title,
              author: item.volumeInfo.authors?.[0] || 'Unknown Author',
              coverImage: item.volumeInfo.imageLinks?.thumbnail || 'https://placehold.co/300x450.png',
              description: item.volumeInfo.description,
              genre: item.volumeInfo.categories?.[0] || genre,
              status: 'plan-to-read',
            }));
            similarBooks.push(...genreBooks);
          }
        }
      }

      // Strategy 3: Author's other works
      if (book?.author && book.author !== 'Unknown Author') {
        const authorResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=inauthor:"${encodeURIComponent(book.author)}"&maxResults=4&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
        );
        const authorData = await authorResponse.json();
        if (authorData.items) {
          const authorBooks = authorData.items.map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors?.[0] || 'Unknown Author',
            coverImage: item.volumeInfo.imageLinks?.thumbnail || 'https://placehold.co/300x450.png',
            description: item.volumeInfo.description,
            genre: item.volumeInfo.categories?.[0] || genre,
            status: 'plan-to-read',
          }));
          similarBooks.push(...authorBooks);
        }
      }

      // Remove duplicates and current book, then score by relevance
      const uniqueBooks = similarBooks
        .filter((item, index, self) => 
          item.id !== params.id && 
          index === self.findIndex(b => b.id === item.id)
        )
        .map(book => ({
          ...book,
          relevanceScore: calculateRelevanceScore(book, title || '', genre, book?.description || '')
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 6);

      setSimilarBooks(uniqueBooks);
    } catch (error) {
      console.error('Error fetching similar books:', error);
      setSimilarBooks([]);
    }
  };

  // Helper function to extract keywords from title and description
  const extractKeywords = (title: string, description: string): string[] => {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'book', 'novel', 'story', 'tale'];
    
    const text = (title + ' ' + description).toLowerCase();
    const words = text.match(/\b[a-z]{3,}\b/g) || [];
    
    const wordCount = words
      .filter(word => !commonWords.includes(word))
      .reduce((acc: Record<string, number>, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  };

  // Helper function to get genre-specific search terms
  const getGenreSpecificTerms = (genre: string): string[] => {
    const genreMap: Record<string, string[]> = {
      'Fantasy': ['fantasy magic dragon sword sorcery kingdom', 'epic fantasy adventure', 'magical powers fantasy'],
      'Romance': ['romance love relationship', 'romantic novel contemporary', 'love story romance'],
      'Science Fiction': ['science fiction space technology', 'sci-fi future dystopian', 'space opera science'],
      'Fiction': ['contemporary fiction literary', 'modern fiction drama', 'literary fiction'],
      'Mystery': ['mystery thriller detective', 'crime mystery suspense', 'detective mystery'],
      'Horror': ['horror supernatural scary', 'horror fiction thriller', 'dark horror'],
      'Young Adult': ['young adult teen fiction', 'YA fantasy romance', 'teen fiction'],
      'Thriller': ['thriller suspense action', 'psychological thriller', 'suspense thriller'],
      'Historical': ['historical fiction period', 'historical romance', 'historical drama'],
    };
    
    return genreMap[genre] || [`${genre.toLowerCase()} fiction`, `${genre.toLowerCase()} novel`];
  };

  // Helper function to calculate relevance score
  const calculateRelevanceScore = (candidateBook: any, originalTitle: string, originalGenre: string, originalDescription: string): number => {
    let score = 0;
    
    // Genre match (high weight)
    if (candidateBook.genre === originalGenre) score += 30;
    
    // Title similarity (medium weight)
    const titleWords = originalTitle.toLowerCase().split(' ');
    const candidateTitleWords = candidateBook.title.toLowerCase().split(' ');
    const titleOverlap = titleWords.filter(word => candidateTitleWords.some((cw: string) => cw.includes(word) || word.includes(cw))).length;
    score += titleOverlap * 10;
    
    // Description similarity (medium weight)
    if (candidateBook.description && originalDescription) {
      const descWords = originalDescription.toLowerCase().split(' ').slice(0, 20);
      const candidateDescWords = candidateBook.description.toLowerCase().split(' ');
      const descOverlap = descWords.filter(word => candidateDescWords.includes(word)).length;
      score += descOverlap * 2;
    }
    
    // Recency bias (small weight)
    score += Math.random() * 5; // Add some randomness to avoid always same results
    
    return score;
  };

  const handleAddBook = async (details: BookClient) => {
    if (!book || !user) return;

    const bookToAdd: Book = {
      ...book,
      status: details.status,
      rating: details.rating,
      startDate: details.startDate,
      endDate: details.endDate,
    };

    try {
      const bookRef = doc(db, 'users', user.uid, 'books', book.id);
      const bookData: any = {
        id: book.id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        status: details.status,
        genre: book.genre,
        description: book.description || null,
        dateAdded: serverTimestamp(),
      };

      if (typeof details.rating === 'number' && !isNaN(details.rating)) {
        bookData.rating = details.rating;
      }

      await setDoc(bookRef, bookData, { merge: true });
      
      // Update global book stats
      await updateBookStats(details.status, details.rating);

      setUserBook(bookToAdd);
      toast({
        title: 'Book Added!',
        description: `"${book.title}" has been added to your list.`,
      });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error adding book:', error);
      toast({
        title: 'Error',
        description: `Failed to add book: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const updateBookStats = async (status: string, rating?: number) => {
    const statsRef = doc(db, 'bookStats', params.id);
    
    try {
      const statsSnap = await getDoc(statsRef);
      let currentStats = statsSnap.exists() ? statsSnap.data() as BookStats : {
        averageRating: 0,
        totalRatings: 0,
        totalReviews: 0,
        statusCounts: {
          'plan-to-read': 0,
          'reading': 0,
          'completed': 0,
          'on-hold': 0,
          'dropped': 0,
        },
      };

      currentStats.statusCounts[status as keyof typeof currentStats.statusCounts]++;

      if (rating && rating > 0) {
        const newTotal = currentStats.totalRatings + 1;
        const newAverage = ((currentStats.averageRating * currentStats.totalRatings) + rating) / newTotal;
        currentStats.averageRating = newAverage;
        currentStats.totalRatings = newTotal;
      }

      await setDoc(statsRef, currentStats, { merge: true });
      setBookStats(currentStats);
    } catch (error) {
      console.error('Error updating book stats:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !book || !reviewText.trim()) {
      toast({
        title: 'Error',
        description: 'Please write a review before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewsRef = collection(db, 'reviews');
      await addDoc(reviewsRef, {
        bookId: params.id,
        userId: user.uid,
        userEmail: user.email,
        review: reviewText.trim(),
        createdAt: serverTimestamp(),
        helpful: 0,
      });

      // Update review count in stats
      const statsRef = doc(db, 'bookStats', params.id);
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        const currentStats = statsSnap.data() as BookStats;
        await updateDoc(statsRef, {
          totalReviews: currentStats.totalReviews + 1,
        });
      }

      setReviewText('');
      toast({
        title: 'Review Posted!',
        description: 'Your review has been posted successfully.',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to post review.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return Array(10).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <Skeleton className="h-64 w-48 rounded-md" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!book) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Book not found.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Main Book Info */}
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      width={250}
                      height={375}
                      className="rounded-md object-cover shadow-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-4 min-w-0">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold break-words">{book.title}</h1>
                      <p className="text-lg md:text-xl text-muted-foreground">by {book.author}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="secondary">{book.genre}</Badge>
                        {userBook && (
                          <Badge variant="outline" className="capitalize">
                            {userBook.status.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {bookStats && (
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          {renderStars(Math.round(bookStats.averageRating), 'w-4 h-4')}
                          <span className="ml-2 font-semibold">
                            {bookStats.averageRating.toFixed(1)}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            ({bookStats.totalRatings} ratings)
                          </span>
                        </div>
                      </div>
                    )}

                    {book.description && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Synopsis</h3>
                        <div 
                          className="text-muted-foreground leading-relaxed text-sm md:text-base max-h-48 overflow-y-auto prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: book.description.replace(/\n/g, '<br>') 
                          }}
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-4">
                      {!userBook ? (
                        <Button onClick={() => setIsModalOpen(true)} size="lg">
                          <Plus className="w-4 h-4 mr-2" />
                          Add to List
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => setIsModalOpen(true)} size="lg">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Entry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            {bookStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-3xl font-bold text-primary">{bookStats.averageRating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">out of 10</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Ratings</p>
                      <p className="text-2xl font-bold">{bookStats.totalRatings}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Reviews</p>
                      <p className="text-2xl font-bold">{bookStats.totalReviews}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Reading Status</p>
                    <div className="space-y-1">
                      {Object.entries(bookStats.statusCounts).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center text-sm">
                          <span className="capitalize">{status.replace('-', ' ')}</span>
                          <span className="font-medium">{String(count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {userBook && userBook.rating && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {renderStars(userBook.rating, 'w-5 h-5')}
                    </div>
                    <p className="text-2xl font-bold text-primary">{userBook.rating}/10</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="similar">Similar Books</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews" className="space-y-6">
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts about this book..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || !reviewText.trim()}
                  >
                    {isSubmittingReview ? 'Posting...' : 'Post Review'}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {review.userEmail.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{review.userEmail.split('@')[0]}</p>
                            <p className="text-sm text-muted-foreground">
                              {review.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                            </p>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{review.review}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="similar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Similar Books</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Books similar to this one based on genre, author, and themes
                </p>
              </CardHeader>
              <CardContent>
                {similarBooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {similarBooks.map((similarBook) => (
                      <div 
                        key={similarBook.id} 
                        className="cursor-pointer transition-transform hover:scale-105" 
                        onClick={() => router.push(`/book/${similarBook.id}`)}
                      >
                        <BookCard book={similarBook} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">No similar books found</p>
                    <p className="text-sm text-muted-foreground">
                      Try exploring books in the {book.genre} genre or by {book.author}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {isModalOpen && (
        <AddBookModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          book={book}
          onAddBook={handleAddBook}
          initialData={userBook}
        />
      )}
    </AppLayout>
  );
}
