'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Calendar, Plus, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateBookClubModal } from '@/components/create-book-club-modal';
import { BookClubCard } from '@/components/book-club-card';

interface BookClub {
  id: string;
  name: string;
  description: string;
  currentBook?: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
  };
  schedule: {
    meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
    nextMeeting?: any;
    timeZone: string;
  };
  createdBy: string;
  createdByEmail: string;
  createdAt: any;
  memberCount: number;
  isPublic: boolean;
  maxMembers?: number;
  tags: string[];
  status: 'active' | 'on-hold' | 'completed';
}

export default function BookClubsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookClubs, setBookClubs] = useState<BookClub[]>([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Subscribe to book clubs
    const clubsRef = collection(db, 'bookClubs');
    const q = query(clubsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clubsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookClub[];
      
      setBookClubs(clubsData);
      setLoadingClubs(false);
    });

    return () => unsubscribe();
  }, [user, loading, router]);

  const filteredClubs = bookClubs.filter(club => {
    if (activeTab === 'discover') return club.isPublic && club.status === 'active';
    if (activeTab === 'my-clubs') return club.createdByEmail === user?.email;
    if (activeTab === 'joined') {
      // TODO: Filter by clubs the user has joined
      return false;
    }
    return true;
  });

  if (loading || loadingClubs) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">Loading book clubs...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Clubs</h1>
            <p className="text-gray-600 mt-2">Join book clubs and read together with fellow book lovers</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Book Club
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover">Discover Clubs</TabsTrigger>
            <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
            <TabsTrigger value="joined">Joined Clubs</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <BookClubCard key={club.id} club={club} />
              ))}
            </div>
            
            {filteredClubs.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No public book clubs yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to create a book club and start reading together!</p>
                  <Button onClick={() => setShowCreateModal(true)} variant="outline">
                    Create the first book club
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-clubs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <BookClubCard key={club.id} club={club} isOwner />
              ))}
            </div>
            
            {filteredClubs.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No book clubs created</h3>
                  <p className="text-gray-600 mb-4">Create your first book club and invite others to join!</p>
                  <Button onClick={() => setShowCreateModal(true)} variant="outline">
                    Create your first book club
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="joined" className="space-y-6">
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Joined clubs feature coming soon</h3>
                <p className="text-gray-600">Track the book clubs you've joined and participate in discussions.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CreateBookClubModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </AppLayout>
  );
}
