import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { UserActivity } from './types';
import { Timestamp } from 'firebase/firestore';

/**
 * Create a new user activity entry
 */
export async function createActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>) {
  try {
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activity,
      timestamp: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating activity:', error);
    return { success: false, error: 'Failed to create activity' };
  }
}

/**
 * Get activities from users that the current user follows
 */
export function getFollowingActivities(
  userId: string,
  limitCount: number = 20,
  callback: (activities: UserActivity[]) => void
) {
  // First get the list of users that the current user follows
  const followsQuery = query(
    collection(db, 'follows'),
    where('followerId', '==', userId)
  );

  return onSnapshot(followsQuery, async (followsSnapshot) => {
    const followedUserIds = followsSnapshot.docs.map(doc => doc.data().followedId);
    
    if (followedUserIds.length === 0) {
      callback([]);
      return;
    }

    // Get activities from followed users (Firestore 'in' queries have a limit of 10 items)
    const activitiesPromises = [];
    for (let i = 0; i < followedUserIds.length; i += 10) {
      const batch = followedUserIds.slice(i, i + 10);
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', 'in', batch),
        where('isPublic', '==', true),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      activitiesPromises.push(getDocs(activitiesQuery));
    }

    try {
      const activitiesSnapshots = await Promise.all(activitiesPromises);
      const allActivities: UserActivity[] = [];

      activitiesSnapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          allActivities.push({ id: doc.id, ...doc.data() } as UserActivity);
        });
      });

      // Sort all activities by timestamp and limit
      const sortedActivities = allActivities
        .sort((a, b) => {
          const aTime = a.timestamp instanceof Timestamp ? a.timestamp.toDate() : new Date(a.timestamp);
          const bTime = b.timestamp instanceof Timestamp ? b.timestamp.toDate() : new Date(b.timestamp);
          return bTime.getTime() - aTime.getTime();
        })
        .slice(0, limitCount);

      callback(sortedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      callback([]);
    }
  });
}

/**
 * Get user's own activities
 */
export function getUserActivities(
  userId: string,
  limitCount: number = 20,
  callback: (activities: UserActivity[]) => void
) {
  const activitiesQuery = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(activitiesQuery, (snapshot) => {
    const activities: UserActivity[] = [];
    snapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() } as UserActivity);
    });
    callback(activities);
  });
}

/**
 * Activity creation helpers for common actions
 */
export const ActivityHelpers = {
  async bookAdded(userId: string, bookId: string, bookTitle: string, bookCover?: string, isPublic: boolean = true) {
    return createActivity({
      userId,
      type: 'book_added',
      bookId,
      bookTitle,
      bookCover,
      isPublic,
    });
  },

  async bookCompleted(userId: string, bookId: string, bookTitle: string, bookCover?: string, rating?: number, isPublic: boolean = true) {
    return createActivity({
      userId,
      type: 'book_completed',
      bookId,
      bookTitle,
      bookCover,
      rating,
      isPublic,
    });
  },

  async reviewPosted(userId: string, bookId: string, bookTitle: string, bookCover?: string, reviewText?: string, rating?: number, isPublic: boolean = true) {
    return createActivity({
      userId,
      type: 'review_posted',
      bookId,
      bookTitle,
      bookCover,
      reviewText: reviewText?.slice(0, 200), // Truncate for activity feed
      rating,
      isPublic,
    });
  },

  async ratingGiven(userId: string, bookId: string, bookTitle: string, bookCover?: string, rating?: number, isPublic: boolean = true) {
    return createActivity({
      userId,
      type: 'rating_given',
      bookId,
      bookTitle,
      bookCover,
      rating,
      isPublic,
    });
  },

  async goalUpdated(userId: string, isPublic: boolean = true) {
    return createActivity({
      userId,
      type: 'goal_updated',
      isPublic,
    });
  },
};
