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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reading' | 'social' | 'quality' | 'milestone' | 'exploration';
  condition: AchievementCondition;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCondition {
  type: 'books_read' | 'books_rated' | 'reviews_written' | 'followers' | 'following' | 'genres_explored' | 'rating_given' | 'consecutive_days' | 'books_in_timeframe';
  target: number;
  timeframe?: 'day' | 'week' | 'month' | 'year';
  rating?: number; // For rating-based achievements
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievementName: string;
  achievementIcon: string;
  achievementPoints: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  completedAt?: Timestamp;
  unlockedAt: Timestamp;
}

export interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  completedAchievements: number;
  lastUpdated: Timestamp;
}

// Define all available achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Reading Milestones
  {
    id: 'first_book',
    name: 'First Steps',
    description: 'Add your first book to the library',
    icon: '📚',
    category: 'milestone',
    condition: { type: 'books_read', target: 1 },
    points: 10,
    rarity: 'common'
  },
  {
    id: 'book_collector',
    name: 'Book Collector',
    description: 'Add 10 books to your library',
    icon: '📖',
    category: 'milestone',
    condition: { type: 'books_read', target: 10 },
    points: 25,
    rarity: 'common'
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Add 50 books to your library',
    icon: '🐛',
    category: 'milestone',
    condition: { type: 'books_read', target: 50 },
    points: 100,
    rarity: 'uncommon'
  },
  {
    id: 'library_master',
    name: 'Library Master',
    description: 'Add 100 books to your library',
    icon: '🏛️',
    category: 'milestone',
    condition: { type: 'books_read', target: 100 },
    points: 250,
    rarity: 'rare'
  },
  {
    id: 'bibliophile',
    name: 'Bibliophile',
    description: 'Add 250 books to your library',
    icon: '📚✨',
    category: 'milestone',
    condition: { type: 'books_read', target: 250 },
    points: 500,
    rarity: 'epic'
  },

  // Quality Achievements
  {
    id: 'first_review',
    name: 'Critic\'s Debut',
    description: 'Write your first book review',
    icon: '✍️',
    category: 'quality',
    condition: { type: 'reviews_written', target: 1 },
    points: 15,
    rarity: 'common'
  },
  {
    id: 'thoughtful_reviewer',
    name: 'Thoughtful Reviewer',
    description: 'Write 25 book reviews',
    icon: '📝',
    category: 'quality',
    condition: { type: 'reviews_written', target: 25 },
    points: 75,
    rarity: 'uncommon'
  },
  {
    id: 'critic_extraordinaire',
    name: 'Critic Extraordinaire',
    description: 'Write 100 book reviews',
    icon: '🎭',
    category: 'quality',
    condition: { type: 'reviews_written', target: 100 },
    points: 300,
    rarity: 'rare'
  },

  // Social Achievements
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Follow 10 other readers',
    icon: '🦋',
    category: 'social',
    condition: { type: 'following', target: 10 },
    points: 30,
    rarity: 'common'
  },
  {
    id: 'popular_reader',
    name: 'Popular Reader',
    description: 'Have 25 followers',
    icon: '⭐',
    category: 'social',
    condition: { type: 'followers', target: 25 },
    points: 100,
    rarity: 'uncommon'
  },
  {
    id: 'influencer',
    name: 'Reading Influencer',
    description: 'Have 100 followers',
    icon: '👑',
    category: 'social',
    condition: { type: 'followers', target: 100 },
    points: 400,
    rarity: 'epic'
  },

  // Exploration Achievements
  {
    id: 'genre_explorer',
    name: 'Genre Explorer',
    description: 'Read books from 5 different genres',
    icon: '🗺️',
    category: 'exploration',
    condition: { type: 'genres_explored', target: 5 },
    points: 50,
    rarity: 'common'
  },
  {
    id: 'genre_master',
    name: 'Genre Master',
    description: 'Read books from 10 different genres',
    icon: '🏆',
    category: 'exploration',
    condition: { type: 'genres_explored', target: 10 },
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'omnireader',
    name: 'Omnireader',
    description: 'Read books from 15 different genres',
    icon: '🌟',
    category: 'exploration',
    condition: { type: 'genres_explored', target: 15 },
    points: 350,
    rarity: 'rare'
  },

  // Quality Rating Achievements
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Give a perfect 10/10 rating',
    icon: '💯',
    category: 'quality',
    condition: { type: 'rating_given', target: 1, rating: 10 },
    points: 25,
    rarity: 'common'
  },
  {
    id: 'quality_seeker',
    name: 'Quality Seeker',
    description: 'Rate 50 books',
    icon: '🎯',
    category: 'quality',
    condition: { type: 'books_rated', target: 50 },
    points: 100,
    rarity: 'uncommon'
  },

  // Speed Reading Achievements
  {
    id: 'speed_reader',
    name: 'Speed Reader',
    description: 'Complete 5 books in one month',
    icon: '⚡',
    category: 'reading',
    condition: { type: 'books_in_timeframe', target: 5, timeframe: 'month' },
    points: 75,
    rarity: 'uncommon'
  },
  {
    id: 'reading_machine',
    name: 'Reading Machine',
    description: 'Complete 10 books in one month',
    icon: '🤖',
    category: 'reading',
    condition: { type: 'books_in_timeframe', target: 10, timeframe: 'month' },
    points: 200,
    rarity: 'rare'
  }
];

/**
 * Check and award achievements for a user
 */
export async function checkAchievements(
  userId: string, 
  books: Book[], 
  userProfile?: UserProfile,
  socialStats?: { followers: number; following: number },
  reviewCount?: number
) {
  try {
    const newAchievements: string[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      const userAchievementRef = doc(db, 'userAchievements', `${userId}_${achievement.id}`);
      const existingAchievement = await getDoc(userAchievementRef);
      
      if (existingAchievement.exists() && existingAchievement.data().isCompleted) {
        continue; // Already completed
      }
      
      const progress = calculateAchievementProgress(achievement, books, userProfile, socialStats, reviewCount);
      const isCompleted = progress >= achievement.condition.target;
      
      if (isCompleted && (!existingAchievement.exists() || !existingAchievement.data().isCompleted)) {
        // Award new achievement
        await setDoc(userAchievementRef, {
          userId,
          achievementId: achievement.id,
          achievementName: achievement.name,
          achievementIcon: achievement.icon,
          achievementPoints: achievement.points,
          progress,
          maxProgress: achievement.condition.target,
          isCompleted: true,
          completedAt: serverTimestamp(),
          unlockedAt: serverTimestamp(),
        } as Omit<UserAchievement, 'id' | 'completedAt' | 'unlockedAt'>);
        
        newAchievements.push(achievement.id);
        
        // Update user progress
        await updateUserProgress(userId, achievement.points);
      } else if (existingAchievement.exists()) {
        // Update progress for existing achievement
        await updateDoc(userAchievementRef, {
          progress,
          isCompleted,
          ...(isCompleted && { completedAt: serverTimestamp() })
        });
      } else if (!isCompleted) {
        // Create new progress tracking
        await setDoc(userAchievementRef, {
          userId,
          achievementId: achievement.id,
          achievementName: achievement.name,
          achievementIcon: achievement.icon,
          achievementPoints: achievement.points,
          progress,
          maxProgress: achievement.condition.target,
          isCompleted: false,
          unlockedAt: serverTimestamp(),
        } as Omit<UserAchievement, 'id' | 'unlockedAt'>);
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * Calculate progress for a specific achievement
 */
function calculateAchievementProgress(
  achievement: Achievement,
  books: Book[],
  userProfile?: UserProfile,
  socialStats?: { followers: number; following: number },
  reviewCount?: number
): number {
  const { condition } = achievement;
  
  switch (condition.type) {
    case 'books_read':
      return books.length;
      
    case 'books_rated':
      return books.filter(book => book.rating && book.rating > 0).length;
      
    case 'reviews_written':
      return reviewCount || 0;
      
    case 'followers':
      return socialStats?.followers || 0;
      
    case 'following':
      return socialStats?.following || 0;
      
    case 'genres_explored':
      const uniqueGenres = new Set(books.map(book => book.genre).filter(Boolean));
      return uniqueGenres.size;
      
    case 'rating_given':
      if (condition.rating) {
        return books.filter(book => book.rating === condition.rating).length;
      }
      return 0;
      
    case 'books_in_timeframe':
      return calculateBooksInTimeframe(books, condition.timeframe!, condition.target);
      
    default:
      return 0;
  }
}

/**
 * Calculate books completed in a specific timeframe
 */
function calculateBooksInTimeframe(books: Book[], timeframe: string, target: number): number {
  const now = new Date();
  let startDate: Date;
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return 0;
  }
  
  const recentBooks = books.filter(book => {
    if (book.status !== 'completed') return false;
    
    const completionDate = book.endDate 
      ? (book.endDate instanceof Timestamp ? book.endDate.toDate() : new Date(book.endDate))
      : (book.dateAdded ? book.dateAdded.toDate() : null);
      
    return completionDate && completionDate >= startDate;
  });
  
  return recentBooks.length;
}

/**
 * Update user progress and level
 */
async function updateUserProgress(userId: string, pointsToAdd: number) {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      const currentProgress = progressSnap.data() as UserProgress;
      const newTotalPoints = currentProgress.totalPoints + pointsToAdd;
      const newLevel = calculateLevel(newTotalPoints);
      
      await updateDoc(progressRef, {
        totalPoints: newTotalPoints,
        level: newLevel,
        completedAchievements: currentProgress.completedAchievements + 1,
        lastUpdated: serverTimestamp(),
      });
    } else {
      const newLevel = calculateLevel(pointsToAdd);
      await setDoc(progressRef, {
        userId,
        totalPoints: pointsToAdd,
        level: newLevel,
        completedAchievements: 1,
        lastUpdated: serverTimestamp(),
      } as Omit<UserProgress, 'lastUpdated'>);
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}

/**
 * Calculate level based on total points
 */
function calculateLevel(totalPoints: number): number {
  // Level formula: Level = floor(sqrt(totalPoints / 100)) + 1
  // This means: Level 1: 0-99 points, Level 2: 100-399 points, Level 3: 400-899 points, etc.
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const achievementsRef = collection(db, 'userAchievements');
    const userAchievementsQuery = query(
      achievementsRef,
      where('userId', '==', userId),
      orderBy('unlockedAt', 'desc')
    );
    
    const achievementsSnapshot = await getDocs(userAchievementsQuery);
    const achievements: UserAchievement[] = [];
    
    achievementsSnapshot.forEach(doc => {
      achievements.push({ id: doc.id, ...doc.data() } as UserAchievement);
    });
    
    return achievements;
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
}

/**
 * Get user progress
 */
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      return { ...progressSnap.data() } as UserProgress;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
}

/**
 * Get achievements by rarity
 */
export function getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.rarity === rarity);
}
