import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { Book, UserProfile } from './types';

export interface ReadingGoal {
  id: string;
  userId: string;
  year: number;
  targetBooks: number;
  targetPages?: number;
  targetGenres?: string[];
  currentBooks: number;
  currentPages: number;
  completedGenres: string[];
  isCompleted: boolean;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GoalProgress {
  booksProgress: number; // percentage
  pagesProgress: number; // percentage
  genresProgress: number; // percentage
  daysLeft: number;
  booksPerDayNeeded: number;
  isOnTrack: boolean;
  monthlyTarget: number;
  currentMonthProgress: number;
}

export interface ReadingChallenge {
  id: string;
  name: string;
  description: string;
  type: 'books' | 'pages' | 'genres' | 'streak' | 'timeframe';
  target: number;
  timeframe?: 'month' | 'quarter' | 'year';
  genres?: string[];
  startDate: Date;
  endDate: Date;
  participants: number;
  isActive: boolean;
}

/**
 * Create or update a reading goal for the year
 */
export async function setReadingGoal(
  userId: string, 
  year: number, 
  targetBooks: number,
  targetPages?: number,
  targetGenres?: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const goalRef = doc(db, 'readingGoals', `${userId}_${year}`);
    const existingGoal = await getDoc(goalRef);
    
    const goalData: Partial<ReadingGoal> = {
      userId,
      year,
      targetBooks,
      targetPages,
      targetGenres,
      updatedAt: serverTimestamp() as Timestamp,
    };

    if (existingGoal.exists()) {
      await updateDoc(goalRef, goalData);
    } else {
      await setDoc(goalRef, {
        ...goalData,
        currentBooks: 0,
        currentPages: 0,
        completedGenres: [],
        isCompleted: false,
        createdAt: serverTimestamp(),
      } as Omit<ReadingGoal, 'id' | 'createdAt' | 'updatedAt'>);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error setting reading goal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's reading goal for a specific year
 */
export async function getReadingGoal(userId: string, year: number): Promise<ReadingGoal | null> {
  try {
    const goalRef = doc(db, 'readingGoals', `${userId}_${year}`);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists()) {
      return { id: goalSnap.id, ...goalSnap.data() } as ReadingGoal;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting reading goal:', error);
    return null;
  }
}

/**
 * Update goal progress when a book is completed
 */
export async function updateGoalProgress(
  userId: string, 
  book: Book, 
  estimatedPages: number = 300
): Promise<void> {
  try {
    const currentYear = new Date().getFullYear();
    const goalRef = doc(db, 'readingGoals', `${userId}_${currentYear}`);
    const goalSnap = await getDoc(goalRef);
    
    if (!goalSnap.exists()) return;
    
    const goal = goalSnap.data() as ReadingGoal;
    
    // Only update for completed books
    if (book.status !== 'completed') return;
    
    const newCurrentBooks = goal.currentBooks + 1;
    const newCurrentPages = goal.currentPages + estimatedPages;
    
    // Update completed genres
    const completedGenres = [...goal.completedGenres];
    if (book.genre && !completedGenres.includes(book.genre)) {
      completedGenres.push(book.genre);
    }
    
    // Check if goal is completed
    const isCompleted = newCurrentBooks >= goal.targetBooks;
    
    const updateData: Partial<ReadingGoal> = {
      currentBooks: newCurrentBooks,
      currentPages: newCurrentPages,
      completedGenres,
      isCompleted,
      updatedAt: serverTimestamp() as Timestamp,
    };
    
    if (isCompleted && !goal.isCompleted) {
      updateData.completedAt = serverTimestamp() as Timestamp;
    }
    
    await updateDoc(goalRef, updateData);
  } catch (error) {
    console.error('Error updating goal progress:', error);
  }
}

/**
 * Calculate detailed goal progress
 */
export function calculateGoalProgress(goal: ReadingGoal, currentDate: Date = new Date()): GoalProgress {
  const startOfYear = new Date(goal.year, 0, 1);
  const endOfYear = new Date(goal.year, 11, 31);
  const totalDaysInYear = Math.ceil((endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, totalDaysInYear - daysPassed);
  
  // Books progress
  const booksProgress = Math.min((goal.currentBooks / goal.targetBooks) * 100, 100);
  
  // Pages progress
  const pagesProgress = goal.targetPages 
    ? Math.min((goal.currentPages / goal.targetPages) * 100, 100)
    : 0;
  
  // Genres progress
  const genresProgress = goal.targetGenres && goal.targetGenres.length > 0
    ? Math.min((goal.completedGenres.length / goal.targetGenres.length) * 100, 100)
    : 0;
  
  // Calculate if on track
  const expectedProgress = (daysPassed / totalDaysInYear) * 100;
  const isOnTrack = booksProgress >= expectedProgress;
  
  // Books per day needed to reach goal
  const booksRemaining = Math.max(0, goal.targetBooks - goal.currentBooks);
  const booksPerDayNeeded = daysLeft > 0 ? booksRemaining / daysLeft : 0;
  
  // Monthly target and current month progress
  const monthlyTarget = Math.ceil(goal.targetBooks / 12);
  const currentMonth = currentDate.getMonth();
  const startOfMonth = new Date(goal.year, currentMonth, 1);
  const endOfMonth = new Date(goal.year, currentMonth + 1, 0);
  
  // For simplicity, estimate current month progress based on overall progress
  // In a real app, you'd track books completed each month
  const currentMonthProgress = Math.min(
    Math.floor((goal.currentBooks % monthlyTarget) / monthlyTarget * 100),
    100
  );
  
  return {
    booksProgress,
    pagesProgress,
    genresProgress,
    daysLeft,
    booksPerDayNeeded,
    isOnTrack,
    monthlyTarget,
    currentMonthProgress,
  };
}

/**
 * Get reading challenges
 */
export async function getReadingChallenges(): Promise<ReadingChallenge[]> {
  try {
    const challengesRef = collection(db, 'readingChallenges');
    const challengesQuery = query(challengesRef, where('isActive', '==', true), orderBy('startDate', 'desc'));
    const challengesSnapshot = await getDocs(challengesQuery);
    
    const challenges: ReadingChallenge[] = [];
    challengesSnapshot.forEach(doc => {
      const data = doc.data();
      challenges.push({
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
      } as ReadingChallenge);
    });
    
    return challenges;
  } catch (error) {
    console.error('Error getting reading challenges:', error);
    return [];
  }
}

/**
 * Create default reading challenges for the year
 */
export async function createDefaultChallenges(year: number): Promise<void> {
  try {
    const challenges: Omit<ReadingChallenge, 'id'>[] = [
      {
        name: 'New Year Reading Sprint',
        description: 'Read 5 books in January to start the year strong',
        type: 'books',
        target: 5,
        timeframe: 'month',
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 0, 31),
        participants: 0,
        isActive: true,
      },
      {
        name: 'Genre Explorer',
        description: 'Read books from 5 different genres',
        type: 'genres',
        target: 5,
        genres: ['Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Romance'],
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31),
        participants: 0,
        isActive: true,
      },
      {
        name: 'Page Turner Challenge',
        description: 'Read 10,000 pages this year',
        type: 'pages',
        target: 10000,
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31),
        participants: 0,
        isActive: true,
      },
      {
        name: 'Summer Reading Challenge',
        description: 'Read 10 books during summer months',
        type: 'books',
        target: 10,
        timeframe: 'quarter',
        startDate: new Date(year, 5, 1), // June
        endDate: new Date(year, 7, 31), // August
        participants: 0,
        isActive: true,
      }
    ];

    const challengesRef = collection(db, 'readingChallenges');
    
    for (const challenge of challenges) {
      await setDoc(doc(challengesRef), challenge);
    }
  } catch (error) {
    console.error('Error creating default challenges:', error);
  }
}

/**
 * Get goal statistics for comparison
 */
export async function getGoalStatistics(): Promise<{
  averageGoal: number;
  completionRate: number;
  topPerformers: Array<{ userId: string; booksRead: number }>;
}> {
  try {
    const currentYear = new Date().getFullYear();
    const goalsRef = collection(db, 'readingGoals');
    const goalsQuery = query(goalsRef, where('year', '==', currentYear));
    const goalsSnapshot = await getDocs(goalsQuery);
    
    let totalTargetBooks = 0;
    let totalCurrentBooks = 0;
    let completedGoals = 0;
    const performers: Array<{ userId: string; booksRead: number }> = [];
    
    goalsSnapshot.forEach(doc => {
      const goal = doc.data() as ReadingGoal;
      totalTargetBooks += goal.targetBooks;
      totalCurrentBooks += goal.currentBooks;
      
      if (goal.isCompleted) {
        completedGoals++;
      }
      
      performers.push({
        userId: goal.userId,
        booksRead: goal.currentBooks,
      });
    });
    
    const totalGoals = goalsSnapshot.size;
    const averageGoal = totalGoals > 0 ? totalTargetBooks / totalGoals : 0;
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    const topPerformers = performers
      .sort((a, b) => b.booksRead - a.booksRead)
      .slice(0, 10);
    
    return {
      averageGoal,
      completionRate,
      topPerformers,
    };
  } catch (error) {
    console.error('Error getting goal statistics:', error);
    return {
      averageGoal: 0,
      completionRate: 0,
      topPerformers: [],
    };
  }
}
