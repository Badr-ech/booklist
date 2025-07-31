import { Book, ReadingStats, UserProfile } from './types';
import { Timestamp } from 'firebase/firestore';

/**
 * Calculate comprehensive reading statistics from user's book collection
 */
export function calculateReadingStats(books: Book[], profile?: UserProfile): ReadingStats {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDate = new Date();
  
  // Basic counts
  const totalBooks = books.length;
  const booksCompleted = books.filter(b => b.status === 'completed').length;
  const booksReading = books.filter(b => b.status === 'reading').length;
  const booksPlanToRead = books.filter(b => b.status === 'plan-to-read').length;
  const booksOnHold = books.filter(b => b.status === 'on-hold').length;
  const booksDropped = books.filter(b => b.status === 'dropped').length;

  // Rating statistics
  const ratedBooks = books.filter(b => typeof b.rating === 'number' && b.rating > 0);
  const averageRating = ratedBooks.length > 0 
    ? ratedBooks.reduce((acc, b) => acc + b.rating!, 0) / ratedBooks.length
    : 0;
  const totalRatings = ratedBooks.length;

  // Pages read (estimated - Google Books API sometimes provides page counts)
  const estimatedPagesRead = booksCompleted * 300; // Rough estimate if no page data

  // This year's books
  const booksThisYear = books.filter(book => {
    if (book.endDate) {
      const endDate = book.endDate instanceof Timestamp ? book.endDate.toDate() : new Date(book.endDate);
      return endDate.getFullYear() === currentYear;
    }
    if (book.dateAdded) {
      const addedDate = book.dateAdded.toDate();
      return addedDate.getFullYear() === currentYear;
    }
    return false;
  }).length;

  // This month's books
  const booksThisMonth = books.filter(book => {
    if (book.endDate) {
      const endDate = book.endDate instanceof Timestamp ? book.endDate.toDate() : new Date(book.endDate);
      return endDate.getFullYear() === currentYear && endDate.getMonth() === currentMonth;
    }
    if (book.dateAdded) {
      const addedDate = book.dateAdded.toDate();
      return addedDate.getFullYear() === currentYear && addedDate.getMonth() === currentMonth;
    }
    return false;
  }).length;

  // Genre breakdown
  const genreBreakdown: Record<string, number> = {};
  books.forEach(book => {
    const genre = book.genre || 'Uncategorized';
    genreBreakdown[genre] = (genreBreakdown[genre] || 0) + 1;
  });

  // Monthly reading counts for the current year
  const monthlyReadingCounts: Record<string, number> = {};
  for (let month = 0; month < 12; month++) {
    const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
    const monthBooks = books.filter(book => {
      if (book.endDate) {
        const endDate = book.endDate instanceof Timestamp ? book.endDate.toDate() : new Date(book.endDate);
        return endDate.getFullYear() === currentYear && endDate.getMonth() === month;
      }
      return false;
    }).length;
    monthlyReadingCounts[monthKey] = monthBooks;
  }

  // Reading goal progress
  const readingGoal = profile?.readingGoal || 0;
  const readingGoalProgress = readingGoal > 0 ? (booksThisYear / readingGoal) * 100 : 0;

  // Reading streak calculation (simplified - would need activity tracking for accuracy)
  const readingStreak = calculateReadingStreak(books);

  // Last activity date
  const lastActivityDate = getLastActivityDate(books);

  return {
    totalBooks,
    booksCompleted,
    booksReading,
    booksPlanToRead,
    booksOnHold,
    booksDropped,
    averageRating: Number(averageRating.toFixed(1)),
    totalRatings,
    pagesRead: estimatedPagesRead,
    readingStreak,
    lastActivityDate,
    booksThisYear,
    booksThisMonth,
    genreBreakdown,
    monthlyReadingCounts,
    readingGoalProgress: Math.min(readingGoalProgress, 100), // Cap at 100%
  };
}

/**
 * Calculate reading streak (simplified version)
 * In a real implementation, this would track daily activity
 */
function calculateReadingStreak(books: Book[]): number {
  // Simplified: count consecutive days with completed books
  const completedBooks = books
    .filter(b => b.status === 'completed' && b.endDate)
    .sort((a, b) => {
      const dateA = a.endDate instanceof Timestamp ? a.endDate.toDate() : new Date(a.endDate!);
      const dateB = b.endDate instanceof Timestamp ? b.endDate.toDate() : new Date(b.endDate!);
      return dateB.getTime() - dateA.getTime();
    });

  if (completedBooks.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < completedBooks.length - 1; i++) {
    const currentEndDate = completedBooks[i].endDate!;
    const nextEndDate = completedBooks[i + 1].endDate!;
    
    const currentDate = currentEndDate instanceof Timestamp 
      ? currentEndDate.toDate() 
      : new Date(currentEndDate);
    const nextDate = nextEndDate instanceof Timestamp 
      ? nextEndDate.toDate() 
      : new Date(nextEndDate);

    const daysDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / oneDayMs);
    
    if (daysDiff <= 7) { // Allow up to a week gap
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get the most recent activity date
 */
function getLastActivityDate(books: Book[]): Timestamp | undefined {
  const dates = books
    .map(book => {
      if (book.endDate instanceof Timestamp) return book.endDate;
      if (book.endDate) return Timestamp.fromDate(new Date(book.endDate));
      if (book.dateAdded) return book.dateAdded;
      return null;
    })
    .filter(date => date !== null)
    .sort((a, b) => b!.seconds - a!.seconds);

  return dates.length > 0 ? dates[0]! : undefined;
}

/**
 * Get reading statistics for a specific time period
 */
export function getReadingStatsForPeriod(
  books: Book[], 
  startDate: Date, 
  endDate: Date
): Partial<ReadingStats> {
  const periodBooks = books.filter(book => {
    if (book.endDate) {
      const bookEndDate = book.endDate instanceof Timestamp ? book.endDate.toDate() : new Date(book.endDate);
      return bookEndDate >= startDate && bookEndDate <= endDate;
    }
    return false;
  });

  return {
    totalBooks: periodBooks.length,
    booksCompleted: periodBooks.filter(b => b.status === 'completed').length,
    averageRating: periodBooks.length > 0 
      ? periodBooks.reduce((acc, b) => acc + (b.rating || 0), 0) / periodBooks.length 
      : 0,
  };
}

/**
 * Get the most read genres
 */
export function getTopGenres(books: Book[], limit: number = 5): Array<{genre: string, count: number}> {
  const genreCounts: Record<string, number> = {};
  
  books.forEach(book => {
    const genre = book.genre || 'Uncategorized';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });

  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre, count]) => ({ genre, count }));
}

/**
 * Calculate reading velocity (books per month)
 */
export function calculateReadingVelocity(books: Book[]): number {
  const completedBooks = books.filter(b => b.status === 'completed' && b.endDate);
  
  if (completedBooks.length < 2) return 0;

  const sortedBooks = completedBooks.sort((a, b) => {
    const endDateA = a.endDate!;
    const endDateB = b.endDate!;
    const dateA = endDateA instanceof Timestamp ? endDateA.toDate() : new Date(endDateA);
    const dateB = endDateB instanceof Timestamp ? endDateB.toDate() : new Date(endDateB);
    return dateA.getTime() - dateB.getTime();
  });

  const firstBook = sortedBooks[0];
  const lastBook = sortedBooks[sortedBooks.length - 1];
  
  const firstEndDate = firstBook.endDate!;
  const lastEndDate = lastBook.endDate!;
  const firstDate = firstEndDate instanceof Timestamp ? firstEndDate.toDate() : new Date(firstEndDate);
  const lastDate = lastEndDate instanceof Timestamp ? lastEndDate.toDate() : new Date(lastEndDate);
  
  const monthsDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44); // Average days per month
  
  return monthsDiff > 0 ? completedBooks.length / monthsDiff : 0;
}
