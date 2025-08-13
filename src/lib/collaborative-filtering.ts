import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { Book } from './types';

export interface UserSimilarity {
  userId: string;
  email: string;
  username?: string;
  similarityScore: number;
  commonBooks: number;
  averageRatingDifference: number;
}

export interface CollaborativeRecommendation extends Book {
  recommendationScore: number;
  recommendedBy: string[];
  averageRating: number;
  reason: string;
}

/**
 * Find users with similar reading tastes
 */
export async function findSimilarUsers(userId: string, limitCount: number = 10): Promise<UserSimilarity[]> {
  try {
    // Get current user's books
    const userBooksRef = collection(db, 'users', userId, 'books');
    const userBooksSnapshot = await getDocs(userBooksRef);
    const userBooks: Book[] = [];
    userBooksSnapshot.forEach(doc => {
      userBooks.push({ id: doc.id, ...doc.data() } as Book);
    });

    if (userBooks.length === 0) {
      return [];
    }

    // Get all users (in a real app, you'd want pagination here)
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const similarUsers: UserSimilarity[] = [];

    for (const userDoc of usersSnapshot.docs) {
      if (userDoc.id === userId) continue;

      // Get this user's books
      const otherUserBooksRef = collection(db, 'users', userDoc.id, 'books');
      const otherUserBooksSnapshot = await getDocs(otherUserBooksRef);
      const otherUserBooks: Book[] = [];
      otherUserBooksSnapshot.forEach(doc => {
        otherUserBooks.push({ id: doc.id, ...doc.data() } as Book);
      });

      if (otherUserBooks.length === 0) continue;

      // Calculate similarity
      const similarity = calculateUserSimilarity(userBooks, otherUserBooks);
      
      if (similarity.commonBooks >= 3) { // Only consider users with at least 3 books in common
        const userData = userDoc.data();
        similarUsers.push({
          userId: userDoc.id,
          email: userData.email || '',
          username: userData.username,
          similarityScore: similarity.score,
          commonBooks: similarity.commonBooks,
          averageRatingDifference: similarity.ratingDifference,
        });
      }
    }

    // Sort by similarity score
    return similarUsers
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error finding similar users:', error);
    return [];
  }
}

/**
 * Calculate similarity between two users based on their book preferences
 */
function calculateUserSimilarity(
  userBooks: Book[], 
  otherUserBooks: Book[]
): { score: number; commonBooks: number; ratingDifference: number } {
  const userBookMap = new Map(userBooks.map(book => [book.id, book]));
  const otherUserBookMap = new Map(otherUserBooks.map(book => [book.id, book]));

  // Find common books
  const commonBookIds = userBooks
    .map(book => book.id)
    .filter(bookId => otherUserBookMap.has(bookId));

  if (commonBookIds.length === 0) {
    return { score: 0, commonBooks: 0, ratingDifference: 0 };
  }

  // Calculate rating correlation for common books
  let totalRatingDifference = 0;
  let ratedCommonBooks = 0;

  for (const bookId of commonBookIds) {
    const userBook = userBookMap.get(bookId)!;
    const otherBook = otherUserBookMap.get(bookId)!;

    if (userBook.rating && otherBook.rating) {
      totalRatingDifference += Math.abs(userBook.rating - otherBook.rating);
      ratedCommonBooks++;
    }
  }

  const averageRatingDifference = ratedCommonBooks > 0 ? totalRatingDifference / ratedCommonBooks : 0;

  // Calculate genre similarity
  const userGenres = new Set(userBooks.map(book => book.genre).filter(Boolean));
  const otherUserGenres = new Set(otherUserBooks.map(book => book.genre).filter(Boolean));
  const genreIntersection = new Set([...userGenres].filter(genre => otherUserGenres.has(genre)));
  const genreUnion = new Set([...userGenres, ...otherUserGenres]);
  const genreSimilarity = genreUnion.size > 0 ? genreIntersection.size / genreUnion.size : 0;

  // Calculate overall similarity score
  const bookOverlap = commonBookIds.length / Math.max(userBooks.length, otherUserBooks.length);
  const ratingCompatibility = ratedCommonBooks > 0 ? Math.max(0, 1 - (averageRatingDifference / 10)) : 0.5;
  
  // Weighted combination of factors
  const similarityScore = (
    bookOverlap * 0.4 +          // 40% book overlap
    ratingCompatibility * 0.4 +   // 40% rating compatibility
    genreSimilarity * 0.2        // 20% genre similarity
  );

  return {
    score: similarityScore,
    commonBooks: commonBookIds.length,
    ratingDifference: averageRatingDifference,
  };
}

/**
 * Generate collaborative filtering recommendations
 */
export async function getCollaborativeRecommendations(
  userId: string, 
  limitCount: number = 20
): Promise<CollaborativeRecommendation[]> {
  try {
    // Get similar users
    const similarUsers = await findSimilarUsers(userId, 20);
    
    if (similarUsers.length === 0) {
      return [];
    }

    // Get current user's books to avoid recommending books they already have
    const userBooksRef = collection(db, 'users', userId, 'books');
    const userBooksSnapshot = await getDocs(userBooksRef);
    const userBookIds = new Set<string>();
    userBooksSnapshot.forEach(doc => {
      userBookIds.add(doc.id);
    });

    // Collect book recommendations from similar users
    const bookRecommendations = new Map<string, {
      book: Book;
      recommendedBy: string[];
      totalScore: number;
      ratingSum: number;
      ratingCount: number;
    }>();

    for (const similarUser of similarUsers) {
      const similarUserBooksRef = collection(db, 'users', similarUser.userId, 'books');
      const similarUserBooksSnapshot = await getDocs(similarUserBooksRef);
      
      similarUserBooksSnapshot.forEach(doc => {
        const book = { id: doc.id, ...doc.data() } as Book;
        
        // Skip books the user already has
        if (userBookIds.has(book.id)) return;

        // Skip books with low ratings (below 6/10)
        if (book.rating && book.rating < 6) return;

        const existingRec = bookRecommendations.get(book.id);
        const bookScore = calculateBookRecommendationScore(book, similarUser);

        if (existingRec) {
          existingRec.recommendedBy.push(similarUser.email);
          existingRec.totalScore += bookScore;
          if (book.rating) {
            existingRec.ratingSum += book.rating;
            existingRec.ratingCount++;
          }
        } else {
          bookRecommendations.set(book.id, {
            book,
            recommendedBy: [similarUser.email],
            totalScore: bookScore,
            ratingSum: book.rating || 0,
            ratingCount: book.rating ? 1 : 0,
          });
        }
      });
    }

    // Convert to final recommendations
    const recommendations: CollaborativeRecommendation[] = [];
    
    for (const [bookId, recData] of bookRecommendations) {
      const averageRating = recData.ratingCount > 0 ? recData.ratingSum / recData.ratingCount : 0;
      const recommendationScore = recData.totalScore / recData.recommendedBy.length;
      
      // Only include books recommended by multiple users or with high scores
      if (recData.recommendedBy.length >= 2 || recommendationScore > 0.7) {
        recommendations.push({
          ...recData.book,
          recommendationScore,
          recommendedBy: recData.recommendedBy,
          averageRating,
          reason: generateRecommendationReason(recData.recommendedBy.length, averageRating),
        });
      }
    }

    // Sort by recommendation score and return top results
    return recommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error generating collaborative recommendations:', error);
    return [];
  }
}

/**
 * Calculate recommendation score for a book from a similar user
 */
function calculateBookRecommendationScore(book: Book, similarUser: UserSimilarity): number {
  let score = similarUser.similarityScore; // Base score from user similarity
  
  // Boost score for highly rated books
  if (book.rating) {
    score *= (book.rating / 10);
  }
  
  // Boost score for completed books (vs plan-to-read)
  if (book.status === 'completed') {
    score *= 1.2;
  }
  
  return score;
}

/**
 * Generate a human-readable reason for the recommendation
 */
function generateRecommendationReason(recommendedByCount: number, averageRating: number): string {
  if (recommendedByCount >= 5) {
    return `Highly recommended by ${recommendedByCount} similar readers`;
  } else if (recommendedByCount >= 3) {
    return `Recommended by ${recommendedByCount} readers with similar taste`;
  } else if (averageRating >= 8) {
    return `Loved by readers similar to you (${averageRating.toFixed(1)}/10)`;
  } else {
    return `Enjoyed by readers with similar preferences`;
  }
}

/**
 * Get books that users with similar taste are currently reading
 */
export async function getTrendingAmongSimilarUsers(userId: string, limitCount: number = 10): Promise<Book[]> {
  try {
    const similarUsers = await findSimilarUsers(userId, 10);
    
    if (similarUsers.length === 0) {
      return [];
    }

    const currentlyReadingBooks = new Map<string, { book: Book; count: number }>();

    for (const similarUser of similarUsers) {
      const similarUserBooksRef = collection(db, 'users', similarUser.userId, 'books');
      const readingQuery = query(
        similarUserBooksRef,
        where('status', '==', 'reading')
      );
      const readingSnapshot = await getDocs(readingQuery);
      
      readingSnapshot.forEach(doc => {
        const book = { id: doc.id, ...doc.data() } as Book;
        const existing = currentlyReadingBooks.get(book.id);
        
        if (existing) {
          existing.count++;
        } else {
          currentlyReadingBooks.set(book.id, { book, count: 1 });
        }
      });
    }

    // Return books being read by multiple similar users
    return Array.from(currentlyReadingBooks.values())
      .filter(item => item.count >= 2)
      .sort((a, b) => b.count - a.count)
      .map(item => item.book)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting trending among similar users:', error);
    return [];
  }
}
