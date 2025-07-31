'use client';

import { AppLayout } from '@/components/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/components/auth-provider';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, doc, getDoc, onSnapshot, query, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/components/theme-provider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ReadingStatsDisplay } from '@/components/reading-stats-display';
import { ReadingGoalManager } from '@/components/reading-goal-manager';
import type { Book, UserProfile, ReadingStats } from '@/lib/types';
import { calculateReadingStats } from '@/lib/reading-stats';
import { BookOpenCheck, Star, TrendingUp, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [readingGoal, setReadingGoal] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchProfileAndBooks = async () => {
        setLoading(true);
        try {
          // Fetch profile
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            setSelectedGenre(data.favoriteGenre || '');
            setUsername(data.username || '');
            setBio(data.bio || '');
            setReadingGoal(data.readingGoal || 0);
          } else {
            console.log("No profile document found, creating one...");
            // Create a basic profile if it doesn't exist
            const defaultUsername = user.email?.split('@')[0] || 'User';
            const newProfile: UserProfile = {
              email: user.email || '',
              username: defaultUsername,
              favoriteGenre: 'Fantasy',
              bio: '',
              joinedDate: serverTimestamp() as any,
              isPublic: true,
              readingGoal: 0,
              currentYear: new Date().getFullYear(),
            };
            
            // Create the profile document
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
            setSelectedGenre(newProfile.favoriteGenre);
            setUsername(newProfile.username);
            setBio(newProfile.bio || '');
            setReadingGoal(newProfile.readingGoal || 0);
          }
        } catch (error) {
            console.error("Error fetching/creating profile:", error);
            setProfile(null);
        }

        // Setup book listener
        const q = query(collection(db, 'users', user.uid, 'books'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const userBooks: Book[] = [];
          querySnapshot.forEach((doc) => {
            userBooks.push({ id: doc.id, ...doc.data() } as Book);
          });
          setBooks(userBooks);
          setLoading(false); // Combined loading state
        }, (error) => {
          console.error("Error fetching books:", error);
          setLoading(false);
        });

        return () => unsubscribe();
      };
      
      fetchProfileAndBooks();

    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);


  const stats: ReadingStats = useMemo(() => {
    return calculateReadingStats(books, profile || undefined);
  }, [books, profile]);

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleUpdateReadingGoal = async (goal: number) => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      readingGoal: goal,
      currentYear: new Date().getFullYear(),
    });
    setProfile((prev) => (prev ? { ...prev, readingGoal: goal } : null));
    setReadingGoal(goal);
  };

  const handleSaveChanges = async () => {
    if (!user || !selectedGenre || !username.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData: Partial<UserProfile> = {
        favoriteGenre: selectedGenre,
        username: username.trim(),
        bio: bio.trim(),
      };

      await updateDoc(userDocRef, updateData);
      setTheme(selectedGenre.toLowerCase() as any);
      setProfile((prev) => (prev ? { ...prev, ...updateData } : null));
      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const userInitial = profile?.username ? profile.username.charAt(0).toUpperCase() : (profile?.email ? profile.email.charAt(0).toUpperCase() : '?');

  const ProfileSkeleton = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const genreOptions = ['Fantasy', 'Romance', 'Sci-Fi', 'Horror', 'Thriller', 'Historical'];

  if (authLoading || loading) {
    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
                </div>
                <ProfileSkeleton />
            </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        </div>

        {profile ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="" alt={profile.username} />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">{profile.username}</CardTitle>
                        <CardDescription className="text-sm truncate">{profile.email}</CardDescription>
                        {profile.joinedDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined {profile.joinedDate.toDate().toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.bio && (
                      <div>
                        <Label className="text-xs font-medium">Bio</Label>
                        <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs font-medium">Favorite Genre</Label>
                      <p className="text-sm mt-1">{profile.favoriteGenre}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Reading Goal Card */}
                <div className="md:col-span-2">
                  <ReadingGoalManager 
                    profile={profile} 
                    stats={stats} 
                    onUpdateGoal={handleUpdateReadingGoal} 
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                    <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalBooks}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.booksCompleted}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageRating}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Year</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.booksThisYear}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <ReadingStatsDisplay stats={stats} profile={profile} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your profile information and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      maxLength={30}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself and your reading preferences..."
                      maxLength={200}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {bio.length}/200 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favorite-genre">Favorite Genre (Theme)</Label>
                    <Select onValueChange={handleGenreChange} value={selectedGenre}>
                      <SelectTrigger id="favorite-genre">
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genreOptions.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      This will also change the application theme.
                    </p>
                  </div>
                  
                  <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <p>Could not load profile. If you've just signed up, please try refreshing the page.</p>
        )}
      </div>
    </AppLayout>
  );
}
