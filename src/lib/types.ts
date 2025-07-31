import { Timestamp } from "firebase/firestore";

export type BookStatus = 'reading' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-read';

// Use a flexible type for dates coming from the client, which might be Date or undefined
export interface BookClient {
    status: BookStatus;
    rating?: number;
    startDate?: Date;
    endDate?: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  status: BookStatus;
  genre: string;
  description?: string;
  rating?: number; // 1-10 scale
  startDate?: Date | Timestamp; // Allow both for flexibility
  endDate?: Date | Timestamp;
  dateAdded?: Timestamp;
}

export interface BookReview {
  id: string;
  bookId: string;
  userId: string;
  userEmail: string;
  review: string;
  createdAt: Timestamp;
  helpful: number;
}

export interface BookSearchFilters {
  genre: string;
  status: string;
  rating: string;
  year: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface BookSearchResult extends Book {
  publishedDate?: string;
  averageRating?: number;
  ratingsCount?: number;
  pageCount?: number;
  publisher?: string;
  language?: string;
}

export interface BookStats {
  averageRating: number;
  totalRatings: number;
  totalReviews: number;
  statusCounts: {
    'plan-to-read': number;
    'reading': number;
    'completed': number;
    'on-hold': number;
    'dropped': number;
  };
}

export interface UserProfile {
  email: string;
  username: string;
  favoriteGenre: string;
  bio?: string;
  joinedDate?: Timestamp;
  isPublic?: boolean;
  favoriteAuthors?: string[];
  readingGoal?: number; // annual book goal
  currentYear?: number; // year for the goal
}

export interface ReadingStats {
  totalBooks: number;
  booksCompleted: number;
  booksReading: number;
  booksPlanToRead: number;
  booksOnHold: number;
  booksDropped: number;
  averageRating: number;
  totalRatings: number;
  pagesRead: number;
  readingStreak: number; // consecutive days
  lastActivityDate?: Timestamp;
  booksThisYear: number;
  booksThisMonth: number;
  genreBreakdown: Record<string, number>;
  monthlyReadingCounts: Record<string, number>; // "2024-01": 5
  readingGoalProgress: number; // percentage of annual goal
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'book_added' | 'book_completed' | 'review_posted' | 'rating_given' | 'goal_updated';
  bookId?: string;
  bookTitle?: string;
  bookCover?: string;
  rating?: number;
  reviewText?: string;
  timestamp: Timestamp;
  isPublic: boolean;
}
