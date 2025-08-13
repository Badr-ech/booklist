'use client';

import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Book, BookStatus } from '@/lib/types';
import { UserListsSection } from '@/components/dashboard-sections/user-lists-section';
import { UserDiscoverSection } from '@/components/dashboard-sections/user-discover-section';
import { UserCommunitySection } from '@/components/dashboard-sections/user-community-section';
import { UserStatsSection } from '@/components/dashboard-sections/user-stats-section';

interface UserData {
  books: Book[];
  readingGoal?: {
    target: number;
    current: number;
  };
  achievements: any[];
  followers: number;
  following: number;
  readingStreak: number;
}

export function AuthenticatedDashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    books: [],
    achievements: [],
    followers: 0,
    following: 0,
    readingStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch user's books
    const booksQuery = query(
      collection(db, 'users', user.uid, 'books'),
      orderBy('dateAdded', 'desc')
    );

    const unsubscribeBooks = onSnapshot(booksQuery, (snapshot) => {
      const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
      setUserData(prev => ({ ...prev, books }));
      setLoading(false);
    });

    // Fetch reading goal for current year
    const currentYear = new Date().getFullYear();
    const goalQuery = query(
      collection(db, 'readingGoals'),
      where('userId', '==', user.uid),
      where('year', '==', currentYear),
      limit(1)
    );

    const unsubscribeGoal = onSnapshot(goalQuery, (snapshot) => {
      if (!snapshot.empty) {
        const goalData = snapshot.docs[0].data();
        setUserData(prev => ({
          ...prev,
          readingGoal: {
            target: goalData.targetBooks || 0,
            current: goalData.currentBooks || 0
          }
        }));
      }
    });

    // Fetch achievements
    const achievementsQuery = query(
      collection(db, 'userAchievements'),
      where('userId', '==', user.uid),
      where('isCompleted', '==', true),
      orderBy('completedAt', 'desc'),
      limit(5)
    );

    const unsubscribeAchievements = onSnapshot(achievementsQuery, (snapshot) => {
      const achievements = snapshot.docs.map(doc => doc.data());
      setUserData(prev => ({ ...prev, achievements }));
    });

    // Fetch follow stats
    const followersQuery = query(
      collection(db, 'follows'),
      where('followedId', '==', user.uid)
    );

    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      setUserData(prev => ({ ...prev, followers: snapshot.size }));
    });

    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', user.uid)
    );

    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      setUserData(prev => ({ ...prev, following: snapshot.size }));
    });

    return () => {
      unsubscribeBooks();
      unsubscribeGoal();
      unsubscribeAchievements();
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UserListsSection books={userData.books} />
      <UserDiscoverSection />
      <UserCommunitySection />
      <UserStatsSection 
        books={userData.books}
        readingGoal={userData.readingGoal}
        achievements={userData.achievements}
        followers={userData.followers}
        following={userData.following}
        readingStreak={userData.readingStreak}
      />
    </div>
  );
}
