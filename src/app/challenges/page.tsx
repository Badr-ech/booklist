'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Calendar, Target, Users, Plus, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChallengeCard } from '@/components/challenge-card';
import { CreateChallengeModal } from '@/components/create-challenge-modal';

interface ReadingChallenge {
  id: string;
  title: string;
  description: string;
  type: 'book-count' | 'page-count' | 'genre-exploration' | 'author-discovery' | 'custom';
  target: number;
  duration: {
    startDate: any;
    endDate: any;
  };
  createdBy: string;
  createdByEmail: string;
  createdAt: any;
  participantCount: number;
  isPublic: boolean;
  tags: string[];
  status: 'upcoming' | 'active' | 'completed';
  reward?: {
    badgeName: string;
    points: number;
    description: string;
  };
}

interface UserChallengeProgress {
  challengeId: string;
  userId: string;
  currentProgress: number;
  isCompleted: boolean;
  joinedAt: any;
  completedAt?: any;
}

export default function ChallengesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [challenges, setChallenges] = useState<ReadingChallenge[]>([]);
  const [userProgress, setUserProgress] = useState<UserChallengeProgress[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Subscribe to challenges
    const challengesRef = collection(db, 'readingChallenges');
    const q = query(challengesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const challengesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReadingChallenge[];
      
      setChallenges(challengesData);
      setLoadingChallenges(false);
    });

    return () => unsubscribe();
  }, [user, loading, router]);

  const now = new Date();
  const filteredChallenges = challenges.filter(challenge => {
    const startDate = challenge.duration.startDate?.toDate();
    const endDate = challenge.duration.endDate?.toDate();
    
    if (activeTab === 'active') {
      return challenge.status === 'active' && startDate <= now && now <= endDate;
    }
    if (activeTab === 'upcoming') {
      return challenge.status === 'upcoming' || startDate > now;
    }
    if (activeTab === 'completed') {
      return challenge.status === 'completed' || endDate < now;
    }
    if (activeTab === 'my-challenges') {
      return challenge.createdByEmail === user?.email;
    }
    return true;
  });

  const seasonalChallenges = [
    {
      id: 'winter-reading-2025',
      title: 'Winter Reading Challenge 2025',
      description: 'Read 8 books during the winter months. Cozy up with great stories!',
      type: 'book-count' as const,
      target: 8,
      duration: {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-20')
      },
      participantCount: 156,
      status: 'active' as const,
      tags: ['seasonal', 'winter', 'cozy'],
      reward: {
        badgeName: 'Winter Reader',
        points: 200,
        description: 'Completed the Winter Reading Challenge'
      }
    },
    {
      id: 'sci-fi-exploration',
      title: 'Sci-Fi Genre Exploration',
      description: 'Discover the wonders of science fiction! Read 5 different sci-fi books.',
      type: 'genre-exploration' as const,
      target: 5,
      duration: {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30')
      },
      participantCount: 89,
      status: 'active' as const,
      tags: ['genre', 'sci-fi', 'exploration'],
      reward: {
        badgeName: 'Sci-Fi Explorer',
        points: 150,
        description: 'Explored the sci-fi genre deeply'
      }
    }
  ];

  if (loading || loadingChallenges) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">Loading challenges...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reading Challenges</h1>
            <p className="text-gray-600 mt-2">Set goals, join challenges, and earn rewards for your reading achievements</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </Button>
        </div>

        {/* Featured/Seasonal Challenges */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Featured Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seasonalChallenges.map((challenge) => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge} 
                isFeatured 
                userProgress={userProgress.find(p => p.challengeId === challenge.id)}
              />
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge}
                  userProgress={userProgress.find(p => p.challengeId === challenge.id)}
                />
              ))}
            </div>
            
            {filteredChallenges.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No active challenges</h3>
                  <p className="text-gray-600 mb-4">Join a challenge or create your own to start achieving your reading goals!</p>
                  <Button onClick={() => setShowCreateModal(true)} variant="outline">
                    Create a challenge
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} isOwner />
              ))}
            </div>
            
            {filteredChallenges.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges created</h3>
                  <p className="text-gray-600 mb-4">Create your first reading challenge and invite others to join!</p>
                  <Button onClick={() => setShowCreateModal(true)} variant="outline">
                    Create your first challenge
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <CreateChallengeModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </AppLayout>
  );
}
