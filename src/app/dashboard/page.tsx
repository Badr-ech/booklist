'use client';

import { AppLayout } from '@/components/app-layout';
import { BookCard } from '@/components/book-card';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Book, BookStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>('all');
  const [sortOption, setSortOption] = useState('dateAdded');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      // Query books ordered by dateAdded
      const q = query(collection(db, 'users', user.uid, 'books'), orderBy('dateAdded', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userBooks: Book[] = [];
        querySnapshot.forEach((doc) => {
          userBooks.push({ id: doc.id, ...doc.data() } as Book);
        });
        setBooks(userBooks);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching books:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;
    if (statusFilter !== 'all') {
      filtered = books.filter((book) => book.status === statusFilter);
    }

    let sorted = [...filtered];
    switch (sortOption) {
      case 'rating':
        // Books with no rating are pushed to the end
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'dateAdded':
      default:
        // Already sorted by dateAdded desc by the Firestore query
        break;
    }
    return sorted;
  }, [books, statusFilter, sortOption]);

  const BookListSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {[...Array(6)].map((_, i) => (
         <div key={i} className="space-y-3">
            <Skeleton className="h-[225px] w-[150px] rounded-md" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
         </div>
      ))}
    </div>
  );

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <BookListSkeleton />
      </AppLayout>
    );
  }

  const statusOptions: { value: BookStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'reading', label: 'Reading' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'plan-to-read', label: 'Plan to Read' },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Sort By</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                <DropdownMenuRadioItem value="dateAdded">Date Added</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 py-4">
        {statusOptions.map(opt => (
          <Button
            key={opt.value}
            variant={statusFilter === opt.value ? 'default' : 'secondary'}
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <div>
        {filteredAndSortedBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 justify-items-center">
            {filteredAndSortedBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                className="cursor-pointer"
                onClick={() => router.push(`/book/${book.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p>Your book list is empty.</p>
            <p className="text-sm">
              Use the Search page to find and add books.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
