import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReadingStats, UserProfile } from '@/lib/types';
import { 
  BookOpenCheck, 
  Star, 
  TrendingUp, 
  Calendar, 
  Target,
  BarChart3,
  Clock,
  Award,
  Flame,
  BookOpen
} from 'lucide-react';

interface ReadingStatsDisplayProps {
  stats: ReadingStats;
  profile?: UserProfile;
}

export function ReadingStatsDisplay({ stats, profile }: ReadingStatsDisplayProps) {
  const topGenres = Object.entries(stats.genreBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.booksCompleted} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRatings} books rated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.readingStreak}</div>
            <p className="text-xs text-muted-foreground">
              days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.booksThisYear}</div>
            <p className="text-xs text-muted-foreground">
              {stats.booksThisMonth} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reading Goal Progress */}
      {profile?.readingGoal && profile.readingGoal > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Reading Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{stats.booksThisYear} of {profile.readingGoal} books</span>
                <span>{stats.readingGoalProgress.toFixed(1)}%</span>
              </div>
              <Progress value={stats.readingGoalProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {profile.readingGoal - stats.booksThisYear > 0 
                  ? `${profile.readingGoal - stats.booksThisYear} books to go!`
                  : 'Goal achieved! 🎉'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reading Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{width: `${(stats.booksCompleted / stats.totalBooks) * 100}%`}}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.booksCompleted}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Reading</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{width: `${(stats.booksReading / stats.totalBooks) * 100}%`}}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.booksReading}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Plan to Read</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{width: `${(stats.booksPlanToRead / stats.totalBooks) * 100}%`}}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.booksPlanToRead}</span>
                </div>
              </div>

              {stats.booksOnHold > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">On Hold</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{width: `${(stats.booksOnHold / stats.totalBooks) * 100}%`}}
                      />
                    </div>
                    <span className="text-sm font-medium">{stats.booksOnHold}</span>
                  </div>
                </div>
              )}

              {stats.booksDropped > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dropped</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{width: `${(stats.booksDropped / stats.totalBooks) * 100}%`}}
                      />
                    </div>
                    <span className="text-sm font-medium">{stats.booksDropped}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Genres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Favorite Genres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topGenres.map(([genre, count], index) => {
                const percentage = (count / stats.totalBooks) * 100;
                return (
                  <div key={genre} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-4">#{index + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{width: `${percentage}%`}}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Read</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pagesRead.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ~{Math.round(stats.pagesRead / (stats.booksCompleted || 1))} avg per book
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Velocity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.booksThisYear / Math.max(new Date().getMonth() + 1, 1)).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              books per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastActivityDate 
                ? Math.floor((Date.now() - stats.lastActivityDate.toDate().getTime()) / (1000 * 60 * 60 * 24))
                : '∞'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              days ago
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
