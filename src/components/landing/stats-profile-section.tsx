import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarChart3, Trophy, Target, Calendar, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function StatsProfileSection() {
  const readingStats = {
    booksRead: 134,
    pagesRead: 45678,
    readingStreak: 23,
    goalProgress: 67
  };

  const recentAchievements = [
    {
      title: "Bookworm",
      description: "Read 100 books",
      icon: Trophy,
      color: "text-yellow-600",
      earnedDate: "2 days ago"
    },
    {
      title: "Page Turner",
      description: "Read 1,000 pages in a month",
      icon: Award,
      color: "text-blue-600",
      earnedDate: "1 week ago"
    },
    {
      title: "Consistent Reader",
      description: "Read for 20 consecutive days",
      icon: Calendar,
      color: "text-green-600",
      earnedDate: "2 weeks ago"
    }
  ];

  const yearlyGoal = {
    target: 52,
    current: 35,
    percentage: Math.round((35 / 52) * 100)
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-headline">
              Stats & Profile
            </h2>
            <p className="text-muted-foreground mt-2">
              Track your reading journey
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
                  <p className="text-2xl font-bold text-green-600">{readingStats.pagesRead.toLocaleString()}</p>
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
                <p className="text-3xl font-bold">{yearlyGoal.current}</p>
                <p className="text-sm text-muted-foreground">of {yearlyGoal.target} books</p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${yearlyGoal.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">{yearlyGoal.percentage}% complete</p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src="https://placehold.co/40x40.png" />
                  <AvatarFallback>YB</AvatarFallback>
                </Avatar>
                <span>Your Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <Badge variant="secondary">Book Explorer</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Followers</span>
                  <span className="text-sm font-medium">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Following</span>
                  <span className="text-sm font-medium">32</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Recent Achievements</h3>
          </div>
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
          <div className="mt-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/achievements">View All Achievements</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
