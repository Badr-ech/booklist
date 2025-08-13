'use server';

import {
  generateBookRecommendations,
  type GenerateBookRecommendationsInput,
} from '@/ai/flows/generate-book-recommendations';
import { db } from '@/lib/firebase';
import { Book, UserFollow, FollowStats } from '@/lib/types';
import { ActivityHelpers } from '@/lib/activity';
import { updateBookPopularity } from '@/lib/trending';
import { checkAchievements } from '@/lib/achievements';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  getDoc, 
  Timestamp, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  addDoc,
  orderBy,
  limit
} from 'firebase/firestore';

export async function getBookRecommendations(input: GenerateBookRecommendationsInput) {
  try {
    const result = await generateBookRecommendations(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting book recommendations:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function addBookToList({ userId, book }: { userId: string, book: Book }) {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const bookRef = doc(db, 'users', userId, 'books', book.id);
    
    const bookData: any = {
      id: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      status: book.status,
      genre: book.genre,
      description: book.description || null,
      dateAdded: serverTimestamp(),
    };
    
    if (typeof book.rating === 'number' && !isNaN(book.rating)) {
        bookData.rating = book.rating;
    }
    
    if (book.startDate) {
        bookData.startDate = book.startDate instanceof Date ? 
            Timestamp.fromDate(book.startDate) : 
            book.startDate;
    }
    
    if (book.endDate) {
        bookData.endDate = book.endDate instanceof Date ? 
            Timestamp.fromDate(book.endDate) : 
            book.endDate;
    }

    // Using { merge: true } is a safe way to update documents.
    // It creates the document if it doesn't exist, or merges the new data
    // with an existing document without overwriting the entire thing.
    await setDoc(bookRef, bookData, { merge: true });
    
    // Update book popularity tracking
    await updateBookPopularity(
      book.id,
      {
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        genre: book.genre,
      },
      book.rating
    );
    
    // Track activity based on status
    if (book.status === 'completed') {
      await ActivityHelpers.bookCompleted(
        userId, 
        book.id, 
        book.title, 
        book.coverImage, 
        book.rating
      );
    } else {
      await ActivityHelpers.bookAdded(
        userId, 
        book.id, 
        book.title, 
        book.coverImage
      );
    }
    
    // Check for new achievements (run in background, don't await)
    checkAchievements(userId, [], undefined, undefined, undefined).catch(error => 
      console.error('Error checking achievements:', error)
    );
    
    return { success: true };

  } catch (error: any) {
    console.error('[actions.ts] Firestore error adding book:', error);
    return {
      success: false,
      error: `An unexpected error occurred while adding the book. Details: ${error.message}`,
    };
  }
}

export async function addBookToWishlist({ userId, book }: { userId: string, book: Omit<Book, 'status'> }) {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  try {
    const wishlistRef = doc(collection(db, 'users', userId, 'wishlist'), book.id);
    await setDoc(wishlistRef, { 
        ...book, 
        status: 'plan-to-read',
        dateAdded: serverTimestamp() 
    });
    
    // Track activity for adding to wishlist
    await ActivityHelpers.bookAdded(
      userId, 
      book.id, 
      book.title, 
      book.coverImage
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error adding book to wishlist:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while adding to wishlist.',
    };
  }
}

export async function handleGoogleSignIn({ uid, email }: { uid: string; email: string | null }) {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: uid,
        email: email,
        favoriteGenre: 'Fantasy',
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error handling Google sign-in:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during sign-in.',
    };
  }
}

// Follow System Actions

export async function followUser({ 
  followerId, 
  followedId, 
  followerEmail, 
  followedEmail, 
  followerUsername, 
  followedUsername 
}: { 
  followerId: string; 
  followedId: string; 
  followerEmail: string; 
  followedEmail: string; 
  followerUsername?: string; 
  followedUsername?: string; 
}) {
  if (!followerId || !followedId) {
    return { success: false, error: 'User authentication required.' };
  }

  if (followerId === followedId) {
    return { success: false, error: 'Cannot follow yourself.' };
  }

  try {
    // Check if already following
    const followsRef = collection(db, 'follows');
    const existingFollowQuery = query(
      followsRef,
      where('followerId', '==', followerId),
      where('followedId', '==', followedId)
    );
    const existingFollow = await getDocs(existingFollowQuery);

    if (!existingFollow.empty) {
      return { success: false, error: 'Already following this user.' };
    }

    // Create follow relationship
    const followData: Omit<UserFollow, 'id'> = {
      followerId,
      followedId,
      followerEmail,
      followedEmail,
      followerUsername,
      followedUsername,
      createdAt: serverTimestamp() as Timestamp,
    };

    await addDoc(followsRef, followData);

    return { success: true };
  } catch (error: any) {
    console.error('Error following user:', error);
    return {
      success: false,
      error: `Failed to follow user: ${error.message}`,
    };
  }
}

export async function unfollowUser({ followerId, followedId }: { followerId: string; followedId: string }) {
  if (!followerId || !followedId) {
    return { success: false, error: 'User authentication required.' };
  }

  try {
    const followsRef = collection(db, 'follows');
    const followQuery = query(
      followsRef,
      where('followerId', '==', followerId),
      where('followedId', '==', followedId)
    );
    
    const followDocs = await getDocs(followQuery);
    
    if (followDocs.empty) {
      return { success: false, error: 'Not following this user.' };
    }

    // Delete the follow relationship
    const followDoc = followDocs.docs[0];
    await deleteDoc(followDoc.ref);

    return { success: true };
  } catch (error: any) {
    console.error('Error unfollowing user:', error);
    return {
      success: false,
      error: `Failed to unfollow user: ${error.message}`,
    };
  }
}

export async function isFollowing({ followerId, followedId }: { followerId: string; followedId: string }) {
  if (!followerId || !followedId) {
    return { isFollowing: false };
  }

  try {
    const followsRef = collection(db, 'follows');
    const followQuery = query(
      followsRef,
      where('followerId', '==', followerId),
      where('followedId', '==', followedId)
    );
    
    const followDocs = await getDocs(followQuery);
    return { isFollowing: !followDocs.empty };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return { isFollowing: false };
  }
}

export async function getFollowStats({ userId }: { userId: string }): Promise<FollowStats> {
  try {
    const followsRef = collection(db, 'follows');
    
    // Get followers count
    const followersQuery = query(followsRef, where('followedId', '==', userId));
    const followersSnapshot = await getDocs(followersQuery);
    const followersCount = followersSnapshot.size;
    
    // Get following count
    const followingQuery = query(followsRef, where('followerId', '==', userId));
    const followingSnapshot = await getDocs(followingQuery);
    const followingCount = followingSnapshot.size;

    return { followersCount, followingCount };
  } catch (error) {
    console.error('Error getting follow stats:', error);
    return { followersCount: 0, followingCount: 0 };
  }
}

export async function getFollowers({ userId, limitCount = 20 }: { userId: string; limitCount?: number }) {
  if (!userId) {
    return { success: false, error: 'User ID required.' };
  }

  try {
    const followsRef = collection(db, 'follows');
    const followersQuery = query(
      followsRef,
      where('followedId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const followersSnapshot = await getDocs(followersQuery);
    const followers = followersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserFollow[];

    return { success: true, data: followers };
  } catch (error: any) {
    console.error('Error getting followers:', error);
    return {
      success: false,
      error: `Failed to get followers: ${error.message}`,
    };
  }
}

export async function getFollowing({ userId, limitCount = 20 }: { userId: string; limitCount?: number }) {
  if (!userId) {
    return { success: false, error: 'User ID required.' };
  }

  try {
    const followsRef = collection(db, 'follows');
    const followingQuery = query(
      followsRef,
      where('followerId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const followingSnapshot = await getDocs(followingQuery);
    const following = followingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserFollow[];

    return { success: true, data: following };
  } catch (error: any) {
    console.error('Error getting following:', error);
    return {
      success: false,
      error: `Failed to get following: ${error.message}`,
    };
  }
}

export async function searchUsers({ searchTerm, limitCount = 10 }: { searchTerm: string; limitCount?: number }) {
  if (!searchTerm.trim()) {
    return { success: false, error: 'Search term is required.' };
  }

  try {
    const usersRef = collection(db, 'users');
    
    // Search by email (contains search term)
    const emailQuery = query(
      usersRef,
      where('email', '>=', searchTerm.toLowerCase()),
      where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      limit(limitCount)
    );
    
    const emailResults = await getDocs(emailQuery);
    const users = emailResults.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If we have a username field, we could also search by username
    // For now, we'll search by email since that's what we have guaranteed

    return { success: true, data: users };
  } catch (error: any) {
    console.error('Error searching users:', error);
    return {
      success: false,
      error: `Failed to search users: ${error.message}`,
    };
  }
}

// Review Enhancement Functions
export async function voteOnReview({ 
  userId, 
  reviewId, 
  voteType 
}: { 
  userId: string; 
  reviewId: string; 
  voteType: 'helpful' | 'unhelpful' 
}) {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const voteRef = doc(db, 'reviewVotes', `${userId}_${reviewId}`);
    const existingVote = await getDoc(voteRef);
    
    if (existingVote.exists()) {
      const currentVote = existingVote.data().voteType;
      if (currentVote === voteType) {
        // Remove vote if same type
        await deleteDoc(voteRef);
        return { success: true, action: 'removed' };
      } else {
        // Update vote type
        await setDoc(voteRef, {
          userId,
          reviewId,
          voteType,
          updatedAt: serverTimestamp()
        });
        return { success: true, action: 'updated' };
      }
    } else {
      // Add new vote
      await setDoc(voteRef, {
        userId,
        reviewId,
        voteType,
        createdAt: serverTimestamp()
      });
      return { success: true, action: 'added' };
    }
  } catch (error: any) {
    console.error('Error voting on review:', error);
    return {
      success: false,
      error: `Failed to vote on review: ${error.message}`,
    };
  }
}

export async function getReviewVotes(reviewId: string) {
  try {
    const votesQuery = query(
      collection(db, 'reviewVotes'),
      where('reviewId', '==', reviewId)
    );
    
    const votesSnapshot = await getDocs(votesQuery);
    let helpfulCount = 0;
    let unhelpfulCount = 0;
    
    votesSnapshot.forEach(doc => {
      const vote = doc.data();
      if (vote.voteType === 'helpful') {
        helpfulCount++;
      } else if (vote.voteType === 'unhelpful') {
        unhelpfulCount++;
      }
    });
    
    return {
      success: true,
      data: {
        helpful: helpfulCount,
        unhelpful: unhelpfulCount,
        total: helpfulCount + unhelpfulCount
      }
    };
  } catch (error: any) {
    console.error('Error getting review votes:', error);
    return {
      success: false,
      error: `Failed to get review votes: ${error.message}`,
    };
  }
}

export async function addReviewComment({
  userId,
  userEmail,
  reviewId,
  comment
}: {
  userId: string;
  userEmail: string;
  reviewId: string;
  comment: string;
}) {
  if (!userId || !userEmail) {
    return { success: false, error: 'User not authenticated.' };
  }

  if (!comment.trim()) {
    return { success: false, error: 'Comment cannot be empty.' };
  }

  try {
    await addDoc(collection(db, 'reviewComments'), {
      reviewId,
      userId,
      userEmail,
      comment: comment.trim(),
      createdAt: serverTimestamp(),
      isEdited: false
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error adding review comment:', error);
    return {
      success: false,
      error: `Failed to add comment: ${error.message}`,
    };
  }
}

export async function getReviewComments(reviewId: string) {
  try {
    const commentsQuery = query(
      collection(db, 'reviewComments'),
      where('reviewId', '==', reviewId),
      orderBy('createdAt', 'asc')
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: comments };
  } catch (error: any) {
    console.error('Error getting review comments:', error);
    return {
      success: false,
      error: `Failed to get comments: ${error.message}`,
    };
  }
}

export async function reportReview({
  userId,
  reviewId,
  reason,
  description
}: {
  userId: string;
  reviewId: string;
  reason: string;
  description?: string;
}) {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    await addDoc(collection(db, 'reviewReports'), {
      reviewId,
      reportedBy: userId,
      reason,
      description: description?.trim() || '',
      status: 'pending',
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error reporting review:', error);
    return {
      success: false,
      error: `Failed to report review: ${error.message}`,
    };
  }
}

// Book Notes & Quotes Functions
export async function addBookNote(noteData: any) {
  try {
    const noteRef = doc(collection(db, 'bookNotes'));
    await setDoc(noteRef, {
      ...noteData,
      id: noteRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: noteRef.id };
  } catch (error: any) {
    console.error('Error adding book note:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserBookNotes(userId: string, bookId?: string) {
  try {
    let q = query(
      collection(db, 'bookNotes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (bookId) {
      q = query(
        collection(db, 'bookNotes'),
        where('userId', '==', userId),
        where('bookId', '==', bookId),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error getting book notes:', error);
    return [];
  }
}

export async function updateBookNote(noteId: string, updates: any) {
  try {
    const noteRef = doc(db, 'bookNotes', noteId);
    await setDoc(noteRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating book note:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBookNote(noteId: string) {
  try {
    await deleteDoc(doc(db, 'bookNotes', noteId));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting book note:', error);
    return { success: false, error: error.message };
  }
}

// Reading History Functions
export async function getUserReadingHistory(userId: string) {
  try {
    // For now, let's get from the user's books collection since we don't have readingHistory yet
    const q = query(
      collection(db, 'users', userId, 'books'),
      where('status', '==', 'completed'),
      orderBy('dateAdded', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error getting reading history:', error);
    return [];
  }
}

export async function addToReadingHistory(userId: string, bookData: any) {
  try {
    const historyRef = doc(collection(db, 'readingHistory'));
    await setDoc(historyRef, {
      ...bookData,
      userId,
      id: historyRef.id,
      dateAdded: serverTimestamp()
    });
    return { success: true, id: historyRef.id };
  } catch (error: any) {
    console.error('Error adding to reading history:', error);
    return { success: false, error: error.message };
  }
}

// Friend Recommendations Functions
export async function getFriendRecommendations(userId: string) {
  try {
    // Get users that the current user follows
    const followingResult = await getFollowing({ userId });
    if (!followingResult.success || !followingResult.data) {
      return [];
    }

    const followedUserIds = followingResult.data.map(follow => follow.followedId);
    
    if (followedUserIds.length === 0) {
      return [];
    }

    // Get books from followed users with high ratings
    const recommendations = new Map();
    
    for (const followedUserId of followedUserIds.slice(0, 10)) { // Limit to prevent too many queries
      try {
        const booksQuery = query(
          collection(db, 'users', followedUserId, 'books'),
          where('status', 'in', ['completed', 'reading']),
          where('rating', '>=', 7), // Only high-rated books
          limit(20)
        );
        
        const booksSnapshot = await getDocs(booksQuery);
        const userEmail = followingResult.data.find(f => f.followedId === followedUserId)?.followedEmail || 'Unknown';
        
        booksSnapshot.docs.forEach(doc => {
          const bookData = doc.data();
          const bookId = bookData.id;
          
          if (!recommendations.has(bookId)) {
            recommendations.set(bookId, {
              book: bookData,
              recommendedBy: [],
              totalRating: 0,
              count: 0
            });
          }
          
          const rec = recommendations.get(bookId);
          rec.recommendedBy.push({
            userId: followedUserId,
            email: userEmail,
            rating: bookData.rating
          });
          rec.totalRating += bookData.rating || 0;
          rec.count += 1;
        });
      } catch (error) {
        console.error(`Error getting books for user ${followedUserId}:`, error);
      }
    }

    // Convert to array and calculate average ratings
    const recommendationsArray = Array.from(recommendations.values()).map(rec => ({
      book: rec.book,
      recommendedBy: rec.recommendedBy,
      averageRating: rec.count > 0 ? rec.totalRating / rec.count : 0,
      totalRecommendations: rec.count
    }));

    // Sort by number of recommendations and rating
    return recommendationsArray
      .sort((a, b) => {
        if (a.totalRecommendations !== b.totalRecommendations) {
          return b.totalRecommendations - a.totalRecommendations;
        }
        return b.averageRating - a.averageRating;
      });

  } catch (error: any) {
    console.error('Error getting friend recommendations:', error);
    return [];
  }
}
