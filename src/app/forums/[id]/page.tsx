'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, onSnapshot, addDoc, query, orderBy, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Users, Plus, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

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

interface ForumPost {
  id: string;
  forumId: string;
  content: string;
  authorId: string;
  authorEmail: string;
  createdAt: any;
  likesCount: number;
  repliesCount: number;
  isSticky?: boolean;
}

export default function ForumDetailPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [forum, setForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loadingForum, setLoadingForum] = useState(true);
  const [postingMessage, setPostingMessage] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch forum details
    const fetchForum = async () => {
      try {
        const forumDoc = await getDoc(doc(db, 'forums', id as string));
        if (forumDoc.exists()) {
          setForum({ id: forumDoc.id, ...forumDoc.data() } as Forum);
        } else {
          router.push('/forums');
        }
      } catch (error) {
        console.error('Error fetching forum:', error);
        router.push('/forums');
      } finally {
        setLoadingForum(false);
      }
    };

    fetchForum();

    // Subscribe to posts
    const postsRef = collection(db, 'forumPosts');
    const q = query(
      postsRef,
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(post => (post as any).forumId === id) as ForumPost[];
      
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [user, loading, router, id]);

  const handlePostMessage = async () => {
    if (!user || !forum || !newPostContent.trim()) return;

    setPostingMessage(true);
    try {
      // Add new post
      await addDoc(collection(db, 'forumPosts'), {
        forumId: forum.id,
        content: newPostContent.trim(),
        authorId: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        likesCount: 0,
        repliesCount: 0,
        isSticky: false
      });

      // Update forum post count and last activity
      await updateDoc(doc(db, 'forums', forum.id), {
        postCount: increment(1),
        lastActivity: serverTimestamp()
      });

      setNewPostContent('');
      toast({
        title: "Message Posted",
        description: "Your message has been posted to the forum."
      });
    } catch (error) {
      console.error('Error posting message:', error);
      toast({
        title: "Error",
        description: "Failed to post message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPostingMessage(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'fiction': '📚',
      'non-fiction': '📖',
      'fantasy': '🧙‍♂️',
      'mystery': '🔍',
      'romance': '💕',
      'sci-fi': '🚀',
      'biography': '👤',
      'general': '💬'
    };
    return emojiMap[category] || '📚';
  };

  if (loading || loadingForum) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">Loading forum...</div>
        </div>
      </AppLayout>
    );
  }

  if (!forum) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">Forum not found</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/forums">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forums
            </Button>
          </Link>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {getCategoryEmoji(forum.category)} {forum.category}
                </Badge>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{forum.memberCount} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{forum.postCount} posts</span>
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl">{forum.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{forum.description}</p>
              <div className="flex flex-wrap gap-2">
                {forum.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Post Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Start a Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your thoughts, ask a question, or start a discussion..."
              rows={4}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handlePostMessage} 
                disabled={!newPostContent.trim() || postingMessage}
              >
                {postingMessage ? 'Posting...' : 'Post Message'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Discussion ({posts.length})</h3>
          
          {posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No discussions yet</h4>
                <p className="text-gray-600">Be the first to start a conversation!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{post.authorEmail}</span>
                      {post.isSticky && (
                        <Badge variant="default" className="text-xs">Pinned</Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {post.createdAt && formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.repliesCount} replies</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-600">
                      <span>♥</span>
                      <span>{post.likesCount} likes</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
