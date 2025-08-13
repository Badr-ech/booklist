"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Book, BarChart3, Filter, Search } from 'lucide-react';
import { useAuth } from './auth-provider';
import { ReadingHistoryEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getUserReadingHistory } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format, startOfYear, endOfYear, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function ReadingHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('completed');
  const [viewMode, setViewMode] = useState<'timeline' | 'stats' | 'calendar'>('timeline');

  useEffect(() => {
    if (user) {
      loadReadingHistory();
    }
  }, [user]);

  const loadReadingHistory = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userHistory = await getUserReadingHistory(user.uid);
      setHistory(userHistory as ReadingHistoryEntry[]);
    } catch (error) {
      console.error('Error loading reading history:', error);
      toast({
        title: "Error",
        description: "Failed to load reading history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.bookAuthor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre === 'all' || entry.bookGenre === selectedGenre;
    const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
    
    let matchesYear = true;
    if (selectedYear !== 'all' && entry.endDate) {
      const entryDate = entry.endDate instanceof Date ? entry.endDate : entry.endDate.toDate();
      const year = entryDate.getFullYear().toString();
      matchesYear = year === selectedYear;
    }
    
    return matchesSearch && matchesGenre && matchesStatus && matchesYear;
  });

  const completedBooks = history.filter(entry => entry.status === 'completed');
  const currentYear = new Date().getFullYear();
  const booksThisYear = completedBooks.filter(entry => {
    if (!entry.endDate) return false;
    const endDate = entry.endDate instanceof Date ? entry.endDate : entry.endDate.toDate();
    return endDate.getFullYear() === currentYear;
  });

  const totalPages = completedBooks.reduce((sum, entry) => sum + (entry.pagesRead || 0), 0);
  const averageRating = completedBooks.length > 0 
    ? completedBooks.reduce((sum, entry) => sum + (entry.rating || 0), 0) / completedBooks.filter(entry => entry.rating).length
    : 0;

  const genreStats = completedBooks.reduce((acc, entry) => {
    acc[entry.bookGenre] = (acc[entry.bookGenre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyStats = booksThisYear.reduce((acc, entry) => {
    if (!entry.endDate) return acc;
    const endDate = entry.endDate instanceof Date ? entry.endDate : entry.endDate.toDate();
    const monthKey = format(endDate, 'yyyy-MM');
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const years = Array.from(new Set(
    completedBooks
      .filter(entry => entry.endDate)
      .map(entry => {
        const endDate = entry.endDate instanceof Date ? entry.endDate : entry.endDate!.toDate();
        return endDate.getFullYear().toString();
      })
  )).sort((a, b) => parseInt(b) - parseInt(a));

  const genres = Array.from(new Set(history.map(entry => entry.bookGenre))).sort();

  if (!user) {
    return (
      <div className="text-center p-8">
        <p>Please log in to view your reading history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reading History</h2>
          <p className="text-muted-foreground">Track your reading journey over time</p>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'timeline' | 'stats' | 'calendar')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Books</p>
                  <p className="text-2xl font-bold">{completedBooks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">This Year</p>
                  <p className="text-2xl font-bold">{booksThisYear.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pages Read</p>
                  <p className="text-2xl font-bold">{totalPages.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="timeline" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          {loading ? (
            <div className="text-center p-8">Loading reading history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No reading history found.</p>
              <p className="text-sm">Start tracking your reading to see your journey!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map(entry => (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={entry.bookCover} 
                        alt={entry.bookTitle}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{entry.bookTitle}</h3>
                            <p className="text-muted-foreground">by {entry.bookAuthor}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant={
                              entry.status === 'completed' ? 'default' :
                              entry.status === 'reading' ? 'secondary' :
                              entry.status === 'on-hold' ? 'outline' : 'destructive'
                            }>
                              {entry.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                            {entry.rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">⭐</span>
                                <span className="text-sm font-medium">{entry.rating}/10</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{entry.bookGenre}</span>
                          {entry.pagesRead && <span>{entry.pagesRead} pages</span>}
                          {entry.readingDuration && <span>{entry.readingDuration} days</span>}
                        </div>
                        
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {entry.startDate && (
                            <span>
                              Started: {format(entry.startDate instanceof Date ? entry.startDate : entry.startDate.toDate(), 'MMM dd, yyyy')}
                            </span>
                          )}
                          {entry.endDate && (
                            <span>
                              {entry.status === 'completed' ? 'Finished' : 'Updated'}: {format(entry.endDate instanceof Date ? entry.endDate : entry.endDate.toDate(), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Genre Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Genre Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(genreStats)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([genre, count]) => (
                    <div key={genre} className="flex justify-between items-center">
                      <span className="text-sm">{genre}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(genreStats))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Reading */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Reading ({currentYear})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = format(new Date(currentYear, i), 'yyyy-MM');
                    const monthName = format(new Date(currentYear, i), 'MMM');
                    const count = monthlyStats[month] || 0;
                    const maxCount = Math.max(...Object.values(monthlyStats), 1);
                    
                    return (
                      <div key={month} className="flex justify-between items-center">
                        <span className="text-sm w-8">{monthName}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(count / maxCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reading Calendar - {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Calendar view coming soon - will show reading activity heatmap
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
