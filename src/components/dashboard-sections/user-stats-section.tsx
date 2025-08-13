'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarChart3, Trophy, Target, Calendar, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Book } from '@/lib/types';

interface UserStatsSectionProps {
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

export function UserStatsSection({ 
  books, 
  readingGoal, 
  achievements, 
  followers, 
  following, 
  readingStreak 
}: UserStatsSectionProps) {
  // Calculate stats from real data
  const completedBooks = books.filter(book => book.status === 'completed').length;
  // For now, use an estimated page count since the basic Book type doesn't include pageCount
  // In a real app, you'd want to store this information when books are added
  const estimatedPages = completedBooks * 250; // Average book is ~250 pages
  
  const goalPercentage = readingGoal && readingGoal.target > 0 
    ? Math.round((readingGoal.current / readingGoal.target) * 100)
    : 0;

  const readingStats = {
    booksRead: completedBooks,
    pagesRead: estimatedPages,
    readingStreak: readingStreak,
    goalProgress: goalPercentage
  };

  // Default reading goal if none exists
  const displayGoal = readingGoal || { target: 12, current: completedBooks };
  const displayPercentage = readingGoal 
    ? goalPercentage 
    : Math.round((completedBooks / 12) * 100);

  // Get recent achievements (limit to 3 for display)
  const recentAchievements = achievements.slice(0, 3).map(achievement => ({
    title: achievement.achievementId || 'Achievement',
    description: achievement.description || 'Completed an achievement',
    icon: Trophy,
    color: "text-yellow-600",
    earnedDate: achievement.completedAt ? formatTimeAgo(achievement.completedAt) : 'Recently'
  }));

  function formatTimeAgo(timestamp: any) {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  return (
    <section className="w-full py-8 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-headline">
              Your Reading Stats
            </h2>
            <p className="text-muted-foreground mt-2">
              Track your reading journey and achievements
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/profile">View Full Profile</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Quick Stats */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Reading Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{readingStats.booksRead}</p>
                  <p className="text-sm text-muted-foreground">Books Read</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {readingStats.pagesRead.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Pages Read</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{readingStats.readingStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{readingStats.goalProgress}%</p>
                  <p className="text-sm text-muted-foreground">Goal Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>2025 Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-3xl font-bold">{displayGoal.current}</p>
                <p className="text-sm text-muted-foreground">of {displayGoal.target} books</p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(displayPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">{displayPercentage}% complete</p>
                <Button asChild variant="ghost" size="sm" className="mt-2">
                  <Link href="/progress">Update Goal</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback>YB</AvatarFallback>
                </Avatar>
                <span>Your Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <Badge variant="secondary">
                    {completedBooks < 5 ? 'New Reader' : 
                     completedBooks < 25 ? 'Book Explorer' :
                     completedBooks < 50 ? 'Avid Reader' :
                     completedBooks < 100 ? 'Book Enthusiast' : 'Master Reader'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Followers</span>
                  <span className="text-sm font-medium">{followers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Following</span>
                  <span className="text-sm font-medium">{following}</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        {(recentAchievements.length > 0 || achievements.length === 0) && (
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">Recent Achievements</h3>
            </div>
            {recentAchievements.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {recentAchievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-8 w-8 ${achievement.color}`} />
                          <div className="flex-1">
                            <h4 className="font-medium">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{achievement.earnedDate}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No achievements yet!</p>
                  <p className="text-sm text-muted-foreground">
                    Complete your first book or join community activities to earn achievements.
                  </p>
                  <Button asChild variant="ghost" className="mt-3">
                    <Link href="/achievements">View All Achievements</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            <div className="mt-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/achievements">View All Achievements</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
