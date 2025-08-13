'use client';

import { AppLayout } from '@/components/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getUserAchievements, 
  getUserProgress, 
  getAchievementsByCategory,
  ACHIEVEMENTS,
  type UserAchievement, 
  type UserProgress,
  type Achievement
} from '@/lib/achievements';
import { useAuth } from '@/components/auth-provider';
import { Trophy, Star, Users, BookOpen, Target, Map, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

const categoryIcons = {
  reading: BookOpen,
  social: Users,
  quality: Star,
  milestone: Trophy,
  exploration: Map,
};

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-200',
  uncommon: 'bg-green-100 text-green-800 border-green-200',
  rare: 'bg-blue-100 text-blue-800 border-blue-200',
  epic: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function AchievementsPage() {
  const { user } = useAuth();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      try {
        const [achievements, progress] = await Promise.all([
          getUserAchievements(user.uid),
          getUserProgress(user.uid)
        ]);
        
        setUserAchievements(achievements);
        setUserProgress(progress);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const getAchievementsToDisplay = () => {
    if (selectedCategory === 'all') {
      return ACHIEVEMENTS;
    }
    return getAchievementsByCategory(selectedCategory);
  };

  const getUserAchievementData = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievementId === achievementId);
  };

  const getCompletedCount = () => {
    return userAchievements.filter(ua => ua.isCompleted).length;
  };

  const getTotalPoints = () => {
    return userProgress?.totalPoints || 0;
  };

  const getCurrentLevel = () => {
    return userProgress?.level || 1;
  };

  const getPointsForNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const pointsForNextLevel = Math.pow(currentLevel, 2) * 100;
    return pointsForNextLevel;
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const userAchievement = getUserAchievementData(achievement.id);
    const isCompleted = userAchievement?.isCompleted || false;
    const progress = userAchievement?.progress || 0;
    const progressPercentage = Math.min((progress / achievement.condition.target) * 100, 100);

    return (
      <Card className={`transition-all duration-200 ${isCompleted ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'hover:shadow-md'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`text-2xl ${isCompleted ? 'grayscale-0' : 'grayscale'}`}>
              {achievement.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${isCompleted ? 'text-yellow-800' : 'text-foreground'}`}>
                  {achievement.name}
                </h3>
                {isCompleted && <Trophy className="w-4 h-4 text-yellow-600" />}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {achievement.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progress: {progress}/{achievement.condition.target}
                  </span>
                  <Badge variant="secondary" className={rarityColors[achievement.rarity]}>
                    {achievement.rarity}
                  </Badge>
                </div>
                
                <Progress value={progressPercentage} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {achievement.points} points
                  </span>
                  {isCompleted && userAchievement?.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      Completed {userAchievement.completedAt.toDate().toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Please log in to view your achievements</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
            <Trophy className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
            <p className="text-muted-foreground">Track your reading milestones and unlock rewards</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Level {getCurrentLevel()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {getCurrentLevel() + 1}</span>
                  <span>{getTotalPoints()}/{getPointsForNextLevel()} pts</span>
                </div>
                <Progress 
                  value={(getTotalPoints() / getPointsForNextLevel()) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {getCompletedCount()}/{ACHIEVEMENTS.length}
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.round((getCompletedCount() / ACHIEVEMENTS.length) * 100)}% complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getTotalPoints().toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Achievement points earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Categories */}
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="space-y-6">
          <TabsList className="grid grid-cols-6 max-w-2xl">
            <TabsTrigger value="all" className="flex items-center gap-1">
              All
            </TabsTrigger>
            <TabsTrigger value="milestone" className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Milestone
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Social
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="exploration" className="flex items-center gap-1">
              <Map className="w-3 h-3" />
              Explore
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getAchievementsToDisplay().map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </div>
        </Tabs>

        {/* Recent Achievements */}
        {!loading && userAchievements.filter(ua => ua.isCompleted).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {userAchievements
                  .filter(ua => ua.isCompleted)
                  .slice(0, 6)
                  .map(userAchievement => {
                    const achievement = ACHIEVEMENTS.find(a => a.id === userAchievement.achievementId);
                    if (!achievement) return null;
                    
                    return (
                      <div key={userAchievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-lg">{achievement.icon}</div>
                        <div>
                          <p className="font-medium text-sm">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {userAchievement.completedAt?.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          +{achievement.points}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
