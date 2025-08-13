'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Users, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Globe, 
  Calendar,
  Target,
  Award,
  MessageCircle,
  Heart,
  Activity,
  Timer
} from 'lucide-react'

interface PlatformStats {
  totalUsers: number
  totalBooks: number
  totalReviews: number
  totalRatings: number
  averageRating: number
  totalReadingGoals: number
  totalFollows: number
  totalBookClubs: number
  totalChallenges: number
  totalNotes: number
}

interface GenreStats {
  genre: string
  books: number
  popularity: number
  averageRating: number
  color: string
}

interface MonthlyStats {
  month: string
  newUsers: number
  booksAdded: number
  reviewsWritten: number
  goalsCompleted: number
}

interface PopularBook {
  id: string
  title: string
  author: string
  cover: string
  totalUsers: number
  averageRating: number
  totalReviews: number
  genre: string
}

interface ReadingTrend {
  period: string
  totalBooks: number
  totalPages: number
  avgRating: number
}

const mockPlatformStats: PlatformStats = {
  totalUsers: 127843,
  totalBooks: 2847362,
  totalReviews: 456789,
  totalRatings: 1892456,
  averageRating: 4.2,
  totalReadingGoals: 34567,
  totalFollows: 234567,
  totalBookClubs: 1234,
  totalChallenges: 567,
  totalNotes: 89234
}

const mockGenreStats: GenreStats[] = [
  { genre: 'Fiction', books: 567890, popularity: 32, averageRating: 4.1, color: '#3B82F6' },
  { genre: 'Mystery & Thriller', books: 298456, popularity: 18, averageRating: 4.3, color: '#8B5CF6' },
  { genre: 'Romance', books: 234567, popularity: 15, averageRating: 4.4, color: '#EC4899' },
  { genre: 'Science Fiction', books: 189234, popularity: 12, averageRating: 4.0, color: '#10B981' },
  { genre: 'Fantasy', books: 167890, popularity: 11, averageRating: 4.2, color: '#F59E0B' },
  { genre: 'Non-Fiction', books: 145678, popularity: 9, averageRating: 3.9, color: '#6B7280' },
  { genre: 'Historical Fiction', books: 98765, popularity: 6, averageRating: 4.1, color: '#EF4444' },
  { genre: 'Young Adult', books: 87654, popularity: 5, averageRating: 4.0, color: '#84CC16' }
]

const mockMonthlyStats: MonthlyStats[] = [
  { month: 'Jan', newUsers: 3245, booksAdded: 15678, reviewsWritten: 2345, goalsCompleted: 456 },
  { month: 'Feb', newUsers: 3567, booksAdded: 17234, reviewsWritten: 2567, goalsCompleted: 523 },
  { month: 'Mar', newUsers: 4123, booksAdded: 19456, reviewsWritten: 2789, goalsCompleted: 612 },
  { month: 'Apr', newUsers: 3890, booksAdded: 18234, reviewsWritten: 2645, goalsCompleted: 567 },
  { month: 'May', newUsers: 4567, booksAdded: 21345, reviewsWritten: 3123, goalsCompleted: 689 },
  { month: 'Jun', newUsers: 5234, booksAdded: 23456, reviewsWritten: 3456, goalsCompleted: 734 },
  { month: 'Jul', newUsers: 4890, booksAdded: 22134, reviewsWritten: 3234, goalsCompleted: 698 },
  { month: 'Aug', newUsers: 5123, booksAdded: 24567, reviewsWritten: 3567, goalsCompleted: 756 },
  { month: 'Sep', newUsers: 4756, booksAdded: 21890, reviewsWritten: 3234, goalsCompleted: 679 },
  { month: 'Oct', newUsers: 5567, booksAdded: 25234, reviewsWritten: 3789, goalsCompleted: 823 },
  { month: 'Nov', newUsers: 6234, booksAdded: 27456, reviewsWritten: 4123, goalsCompleted: 891 },
  { month: 'Dec', newUsers: 5890, booksAdded: 26234, reviewsWritten: 3890, goalsCompleted: 834 }
]

const mockPopularBooks: PopularBook[] = [
  {
    id: '1',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    cover: 'https://covers.openlibrary.org/b/id/12380-L.jpg',
    totalUsers: 23456,
    averageRating: 4.6,
    totalReviews: 5678,
    genre: 'Science Fiction'
  },
  {
    id: '2',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    cover: 'https://covers.openlibrary.org/b/id/12381-L.jpg',
    totalUsers: 21234,
    averageRating: 4.5,
    totalReviews: 6789,
    genre: 'Historical Fiction'
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    cover: 'https://covers.openlibrary.org/b/id/12382-L.jpg',
    totalUsers: 19876,
    averageRating: 4.3,
    totalReviews: 4567,
    genre: 'Science Fiction'
  },
  {
    id: '4',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    cover: 'https://covers.openlibrary.org/b/id/12383-L.jpg',
    totalUsers: 18654,
    averageRating: 4.2,
    totalReviews: 5234,
    genre: 'Mystery & Thriller'
  },
  {
    id: '5',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    cover: 'https://covers.openlibrary.org/b/id/12384-L.jpg',
    totalUsers: 17890,
    averageRating: 4.4,
    totalReviews: 6123,
    genre: 'Fiction'
  }
]

const mockReadingTrends: ReadingTrend[] = [
  { period: 'Q1 2023', totalBooks: 234567, totalPages: 78234567, avgRating: 4.1 },
  { period: 'Q2 2023', totalBooks: 267890, totalPages: 89567234, avgRating: 4.2 },
  { period: 'Q3 2023', totalBooks: 289456, totalPages: 95234567, avgRating: 4.1 },
  { period: 'Q4 2023', totalBooks: 312345, totalPages: 103456789, avgRating: 4.3 },
  { period: 'Q1 2024', totalBooks: 345678, totalPages: 115678234, avgRating: 4.2 }
]

export default function GlobalStatistics() {
  const [stats, setStats] = useState<PlatformStats>(mockPlatformStats)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const COLORS = mockGenreStats.map(stat => stat.color)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Global Statistics</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Explore reading trends and statistics from our global community
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-blue-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatNumber(stats.totalUsers)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Total Users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-green-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatNumber(stats.totalBooks)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Books Tracked
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-purple-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatNumber(stats.totalReviews)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Reviews Written
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-12 w-12 mx-auto text-yellow-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.averageRating}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Average Rating
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="genres">Genres</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Community Engagement</CardTitle>
                <CardDescription>Social features and user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Total Follows</span>
                    </div>
                    <span className="text-xl font-bold">{formatNumber(stats.totalFollows)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Book Clubs</span>
                    </div>
                    <span className="text-xl font-bold">{formatNumber(stats.totalBookClubs)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Reading Goals</span>
                    </div>
                    <span className="text-xl font-bold">{formatNumber(stats.totalReadingGoals)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Challenges</span>
                    </div>
                    <span className="text-xl font-bold">{formatNumber(stats.totalChallenges)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-amber-500" />
                      <span className="font-medium">Notes & Quotes</span>
                    </div>
                    <span className="text-xl font-bold">{formatNumber(stats.totalNotes)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>Platform activity over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockMonthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newUsers" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="reviewsWritten" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reading Activity Timeline</CardTitle>
              <CardDescription>Books added and goals completed throughout the year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockMonthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="booksAdded" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="goalsCompleted" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genres" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Genre Distribution</CardTitle>
                <CardDescription>Most popular genres by book count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={mockGenreStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ genre, popularity }) => `${genre} (${popularity}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="popularity"
                    >
                      {mockGenreStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Genre Statistics</CardTitle>
                <CardDescription>Detailed breakdown by genre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockGenreStats.map((genre) => (
                    <div key={genre.genre} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: genre.color }}
                          />
                          <span className="font-medium">{genre.genre}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{formatNumber(genre.books)} books</div>
                          <div className="text-xs text-gray-500">{genre.averageRating}★ avg</div>
                        </div>
                      </div>
                      <Progress value={genre.popularity} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Reading Trends Over Time</CardTitle>
                <CardDescription>Quarterly reading statistics and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockReadingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalBooks" fill="#3B82F6" name="Books Read" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Growth Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">+23%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      User growth this month
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Avg. Reading Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">2.4h</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Daily reading time
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Active users this week
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Books</CardTitle>
              <CardDescription>Books with the highest user engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPopularBooks.map((book, index) => (
                  <div key={book.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                      <span className="font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    
                    <img 
                      src={book.cover} 
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{book.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">by {book.author}</p>
                      <Badge variant="outline" className="mt-1">{book.genre}</Badge>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{book.averageRating}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {formatNumber(book.totalUsers)} readers
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(book.totalReviews)} reviews
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-8 text-center">
          <Globe className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">
            Join Our Growing Community
          </h3>
          <p className="text-blue-700 dark:text-blue-200 mb-6 max-w-2xl mx-auto">
            Become part of a global community of readers sharing their love for books, 
            discovering new stories, and connecting through literature.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Start Reading Today
            </Button>
            <Button variant="outline">
              Explore Trending Books
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
