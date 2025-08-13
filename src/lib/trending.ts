import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore';
import { Book } from './types';

export interface TrendingBook extends Book {
  trendingScore: number;
  weeklyAdditions: number;
  totalUsers: number;
  averageRating: number;
  lastUpdated: Timestamp;
}

export interface BookPopularityData {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  bookGenre: string;
  weeklyAdditions: number;
  totalUsers: number;
  averageRating: number;
  totalRatings: number;
  trendingScore: number;
  lastUpdated: Timestamp;
}

/**
 * Update book popularity metrics when a user adds a book
 */
export async function updateBookPopularity(
  bookId: string, 
  bookData: { title: string; author: string; coverImage: string; genre: string },
  rating?: number
) {
  try {
    const popularityRef = doc(db, 'bookPopularity', bookId);
    const popularitySnap = await getDoc(popularityRef);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (popularitySnap.exists()) {
      const currentData = popularitySnap.data() as BookPopularityData;
      const lastUpdated = currentData.lastUpdated.toDate();
      
      // Reset weekly count if it's been more than a week
      const weeklyAdditions = lastUpdated < oneWeekAgo ? 1 : currentData.weeklyAdditions + 1;
      
      // Update average rating
      let newAverageRating = currentData.averageRating;
      let newTotalRatings = currentData.totalRatings;
      
      if (rating && rating > 0) {
        const totalRatingSum = currentData.averageRating * currentData.totalRatings;
        newTotalRatings = currentData.totalRatings + 1;
        newAverageRating = (totalRatingSum + rating) / newTotalRatings;
      }
      
      // Calculate trending score (weighted combination of factors)
      const trendingScore = calculateTrendingScore(
        weeklyAdditions,
        currentData.totalUsers + 1,
        newAverageRating
      );

      await updateDoc(popularityRef, {
        weeklyAdditions,
        totalUsers: currentData.totalUsers + 1,
        averageRating: newAverageRating,
        totalRatings: newTotalRatings,
        trendingScore,
        lastUpdated: serverTimestamp(),
      });
    } else {
      // Create new popularity record
      const initialData: Omit<BookPopularityData, 'lastUpdated'> = {
        bookId,
        bookTitle: bookData.title,
        bookAuthor: bookData.author,
        bookCover: bookData.coverImage,
        bookGenre: bookData.genre,
        weeklyAdditions: 1,
        totalUsers: 1,
        averageRating: rating && rating > 0 ? rating : 0,
        totalRatings: rating && rating > 0 ? 1 : 0,
        trendingScore: calculateTrendingScore(1, 1, rating && rating > 0 ? rating : 0),
      };

      await setDoc(popularityRef, {
        ...initialData,
        lastUpdated: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating book popularity:', error);
  }
}

/**
 * Calculate trending score based on multiple factors
 */
function calculateTrendingScore(weeklyAdditions: number, totalUsers: number, averageRating: number): number {
  // Weighted formula: 40% weekly activity, 30% total users, 30% rating
  const weeklyWeight = 0.4;
  const totalUsersWeight = 0.3;
  const ratingWeight = 0.3;
  
  // Normalize values
  const normalizedWeekly = Math.min(weeklyAdditions / 10, 1); // Cap at 10 weekly additions
  const normalizedTotal = Math.min(totalUsers / 100, 1); // Cap at 100 total users
  const normalizedRating = averageRating / 10; // Rating is already 0-10
  
  return (
    normalizedWeekly * weeklyWeight +
    normalizedTotal * totalUsersWeight +
    normalizedRating * ratingWeight
  ) * 100;
}

/**
 * Get trending books
 */
export async function getTrendingBooks(limitCount: number = 20): Promise<TrendingBook[]> {
  try {
    const popularityRef = collection(db, 'bookPopularity');
    const trendingQuery = query(
      popularityRef,
      orderBy('trendingScore', 'desc'),
      limit(limitCount)
    );
    
    const trendingSnapshot = await getDocs(trendingQuery);
    const trendingBooks: TrendingBook[] = [];
    
    trendingSnapshot.forEach(doc => {
      const data = doc.data() as BookPopularityData;
      trendingBooks.push({
        id: data.bookId,
        title: data.bookTitle,
        author: data.bookAuthor,
        coverImage: data.bookCover,
        genre: data.bookGenre,
        status: 'plan-to-read',
        trendingScore: data.trendingScore,
        weeklyAdditions: data.weeklyAdditions,
        totalUsers: data.totalUsers,
        averageRating: data.averageRating,
        lastUpdated: data.lastUpdated,
      });
    });
    
    return trendingBooks;
  } catch (error) {
    console.error('Error getting trending books:', error);
    return [];
  }
}

/**
 * Get popular books by genre
 */
export async function getPopularBooksByGenre(genre: string, limitCount: number = 10): Promise<TrendingBook[]> {
  try {
    const popularityRef = collection(db, 'bookPopularity');
    const genreQuery = query(
      popularityRef,
      where('bookGenre', '==', genre),
      orderBy('totalUsers', 'desc'),
      limit(limitCount)
    );
    
    const genreSnapshot = await getDocs(genreQuery);
    const popularBooks: TrendingBook[] = [];
    
    genreSnapshot.forEach(doc => {
      const data = doc.data() as BookPopularityData;
      popularBooks.push({
        id: data.bookId,
        title: data.bookTitle,
        author: data.bookAuthor,
        coverImage: data.bookCover,
        genre: data.bookGenre,
        status: 'plan-to-read',
        trendingScore: data.trendingScore,
        weeklyAdditions: data.weeklyAdditions,
        totalUsers: data.totalUsers,
        averageRating: data.averageRating,
        lastUpdated: data.lastUpdated,
      });
    });
    
    return popularBooks;
  } catch (error) {
    console.error('Error getting popular books by genre:', error);
    return [];
  }
}

/**
 * Cleanup old trending data (run periodically)
 */
export async function cleanupOldTrendingData() {
  try {
    const popularityRef = collection(db, 'bookPopularity');
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const oldDataQuery = query(
      popularityRef,
      where('lastUpdated', '<', Timestamp.fromDate(oneMonthAgo)),
      where('weeklyAdditions', '==', 0)
    );
    
    const oldDataSnapshot = await getDocs(oldDataQuery);
    
    // Reset weekly additions for old records
    const updatePromises = oldDataSnapshot.docs.map(doc => 
      updateDoc(doc.ref, { 
        weeklyAdditions: 0,
        trendingScore: calculateTrendingScore(0, doc.data().totalUsers, doc.data().averageRating)
      })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error cleaning up old trending data:', error);
  }
}
