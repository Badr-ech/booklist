'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { collection, onSnapshot, doc, addDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateForumModal } from '@/components/create-forum-modal';
import { ForumCard } from '@/components/forum-card';

interface Forum {
  id: string;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: any;
  memberCount: number;
  postCount: number;
  isActive: boolean;
  tags: string[];
  lastActivity?: any;
}

export default function ForumsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [forums, setForums] = useState<Forum[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingForums, setLoadingForums] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Subscribe to forums
    const forumsRef = collection(db, 'forums');
    const q = query(forumsRef, orderBy('lastActivity', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const forumsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Forum[];
      
      setForums(forumsData);
      setLoadingForums(false);
    });

    return () => unsubscribe();
  }, [user, loading, router]);

  const filteredForums = forums.filter(forum => {
    if (activeTab === 'all') return forum.isActive;
    if (activeTab === 'my-forums') return forum.createdByEmail === user?.email;
    if (activeTab === 'popular') return forum.memberCount > 5;
    return forum.category === activeTab;
  });

  const categories = [
    { id: 'fiction', name: 'Fiction', icon: '📚' },
    { id: 'non-fiction', name: 'Non-Fiction', icon: '📖' },
    { id: 'fantasy', name: 'Fantasy', icon: '🧙‍♂️' },
    { id: 'mystery', name: 'Mystery', icon: '🔍' },
    { id: 'romance', name: 'Romance', icon: '💕' },
    { id: 'sci-fi', name: 'Sci-Fi', icon: '🚀' },
    { id: 'biography', name: 'Biography', icon: '👤' },
    { id: 'general', name: 'General Discussion', icon: '💬' }
  ];

  if (loading || loadingForums) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">Loading forums...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discussion Forums</h1>
            <p className="text-gray-600 mt-2">Join conversations about your favorite books and discover new perspectives</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Forum
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="all">All Forums</TabsTrigger>
            <TabsTrigger value="my-forums">My Forums</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="fiction">Fiction</TabsTrigger>
            <TabsTrigger value="non-fiction">Non-Fiction</TabsTrigger>
            <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
            <TabsTrigger value="mystery">Mystery</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForums.map((forum) => (
              <ForumCard key={forum.id} forum={forum} />
            ))}
          </div>

          {filteredForums.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No forums found</h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'my-forums' 
                    ? "You haven't created any forums yet"
                    : "No forums match your current filter"}
                </p>
                <Button onClick={() => setShowCreateModal(true)} variant="outline">
                  Create the first forum
                </Button>
              </CardContent>
            </Card>
          )}
        </Tabs>

        <CreateForumModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)}
          categories={categories}
        />
      </div>
    </AppLayout>
  );
}
