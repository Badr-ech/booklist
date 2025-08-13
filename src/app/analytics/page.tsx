'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { collection, query, onSnapshot, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  MessageCircle, 
  Trophy, 
  Activity,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnalyticsChart } from '@/components/analytics-chart';
import { format, subDays, subMonths } from 'date-fns';

interface AnalyticsData {
  totalUsers: number;
  totalBooks: number;
  totalReviews: number;
  totalForums: number;
  totalBookClubs: number;
  totalChallenges: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  booksAddedToday: number;
  booksAddedWeek: number;
  popularGenres: { genre: string; count: number }[];
  topBooks: { title: string; author: string; users: number }[];
  userGrowth: { date: string; users: number }[];
  engagementMetrics: {
    avgBooksPerUser: number;
    avgRating: number;
    reviewRate: number;
    retentionRate: number;
  };
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Admin check - only allow specific admin emails
  const adminEmails = [
    'admin@yourbooklist.com',
    'analytics@yourbooklist.com',
    // Add your admin email here
  ];

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user is admin
    if (!adminEmails.includes(user.email || '')) {
      router.push('/dashboard');
      return;
    }

    fetchAnalyticsData();
  }, [user, loading, router, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoadingData(true);
    try {
      // Simulate analytics data collection
      // In a real app, you'd aggregate this data from your collections
      
      const [
        usersSnapshot,
        booksSnapshot,
        forumsSnapshot,
        bookClubsSnapshot,
        challengesSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'books')),
        getDocs(collection(db, 'forums')),
        getDocs(collection(db, 'bookClubs')),
        getDocs(collection(db, 'readingChallenges'))
      ]);

      // Calculate basic metrics
      const totalUsers = usersSnapshot.size;
      const totalBooks = booksSnapshot.size;
      const totalForums = forumsSnapshot.size;
      const totalBookClubs = bookClubsSnapshot.size;
      const totalChallenges = challengesSnapshot.size;

      // Mock additional analytics data
      const analyticsData: AnalyticsData = {
        totalUsers,
        totalBooks,
        totalReviews: Math.floor(totalBooks * 0.4), // Assume 40% of books have reviews
        totalForums,
        totalBookClubs,
        totalChallenges,
        activeUsersToday: Math.floor(totalUsers * 0.05), // 5% daily active
        activeUsersWeek: Math.floor(totalUsers * 0.25), // 25% weekly active
        booksAddedToday: Math.floor(totalBooks * 0.001), // 0.1% books added today
        booksAddedWeek: Math.floor(totalBooks * 0.01), // 1% books added this week
        popularGenres: [
          { genre: 'Fiction', count: Math.floor(totalBooks * 0.35) },
          { genre: 'Fantasy', count: Math.floor(totalBooks * 0.20) },
          { genre: 'Mystery', count: Math.floor(totalBooks * 0.15) },
          { genre: 'Romance', count: Math.floor(totalBooks * 0.12) },
          { genre: 'Sci-Fi', count: Math.floor(totalBooks * 0.10) },
          { genre: 'Non-Fiction', count: Math.floor(totalBooks * 0.08) }
        ],
        topBooks: [
          { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', users: Math.floor(totalUsers * 0.15) },
          { title: 'Fourth Wing', author: 'Rebecca Yarros', users: Math.floor(totalUsers * 0.12) },
          { title: 'It Ends with Us', author: 'Colleen Hoover', users: Math.floor(totalUsers * 0.10) },
          { title: 'The Song of Achilles', author: 'Madeline Miller', users: Math.floor(totalUsers * 0.09) },
          { title: 'Project Hail Mary', author: 'Andy Weir', users: Math.floor(totalUsers * 0.08) }
        ],
        userGrowth: generateUserGrowthData(totalUsers),
        engagementMetrics: {
          avgBooksPerUser: totalUsers > 0 ? Math.round((totalBooks / totalUsers) * 10) / 10 : 0,
          avgRating: 7.8,
          reviewRate: 0.42,
          retentionRate: 0.68
        }
      };

      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  const generateUserGrowthData = (totalUsers: number) => {
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const users = Math.floor(totalUsers * (1 - (i / days) * 0.3)); // Mock growth curve
      data.push({
        date: format(date, 'MMM dd'),
        users
      });
    }
    return data;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', analyticsData.totalUsers],
      ['Total Books', analyticsData.totalBooks],
      ['Total Reviews', analyticsData.totalReviews],
      ['Active Users (Week)', analyticsData.activeUsersWeek],
      ['Average Books per User', analyticsData.engagementMetrics.avgBooksPerUser],
      ['Average Rating', analyticsData.engagementMetrics.avgRating],
      ['Review Rate', analyticsData.engagementMetrics.reviewRate],
      ['Retention Rate', analyticsData.engagementMetrics.retentionRate]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yourbooklist-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || loadingData) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center">Loading analytics...</div>
        </div>
      </AppLayout>
    );
  }

  if (!analyticsData) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center">Unable to load analytics data</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Platform insights and performance metrics</p>
          </div>
          <div className="flex space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{analyticsData.activeUsersWeek} active this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalBooks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{analyticsData.booksAddedWeek} added this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Features</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analyticsData.totalForums + analyticsData.totalBookClubs + analyticsData.totalChallenges).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Forums, clubs & challenges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(analyticsData.engagementMetrics.retentionRate * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                User retention rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart data={analyticsData.userGrowth} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Genres</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.popularGenres.map((genre) => (
                    <div key={genre.genre} className="flex items-center justify-between">
                      <span className="text-sm">{genre.genre}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(genre.count / analyticsData.popularGenres[0].count) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{genre.count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Daily Active Users</span>
                    <Badge>{analyticsData.activeUsersToday}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Active Users</span>
                    <Badge>{analyticsData.activeUsersWeek}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Registered</span>
                    <Badge variant="secondary">{analyticsData.totalUsers}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Avg Books per User</span>
                    <Badge>{analyticsData.engagementMetrics.avgBooksPerUser}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Review Rate</span>
                    <Badge>{Math.round(analyticsData.engagementMetrics.reviewRate * 100)}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention Rate</span>
                    <Badge>{Math.round(analyticsData.engagementMetrics.retentionRate * 100)}%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Rating</span>
                    <Badge>{analyticsData.engagementMetrics.avgRating}/10</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Reviews</span>
                    <Badge variant="secondary">{analyticsData.totalReviews}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Books by Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topBooks.map((book, index) => (
                    <div key={book.title} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm text-gray-500">{book.author}</p>
                        </div>
                      </div>
                      <Badge>{book.users} users</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Forums</span>
                    <Badge>{analyticsData.totalForums}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Book Clubs</span>
                    <Badge>{analyticsData.totalBookClubs}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Challenges</span>
                    <Badge>{analyticsData.totalChallenges}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
