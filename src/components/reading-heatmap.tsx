"use client";

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Book, TrendingUp } from 'lucide-react';
import { useAuth } from './auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { getUserReadingHistory } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { 
  format, 
  startOfYear, 
  endOfYear, 
  eachDayOfInterval, 
  isSameDay, 
  getDay,
  startOfWeek,
  addWeeks 
} from 'date-fns';

interface ReadingDay {
  date: Date;
  count: number;
  books: string[];
}

export function ReadingHeatmap() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [readingData, setReadingData] = useState<ReadingDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    longestStreak: 0,
    currentStreak: 0,
    totalBooks: 0
  });

  useEffect(() => {
    if (user) {
      loadReadingData();
    }
  }, [user, selectedYear]);

  const loadReadingData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const history = await getUserReadingHistory(user.uid);
      
      const year = parseInt(selectedYear);
      const yearStart = startOfYear(new Date(year, 0, 1));
      const yearEnd = endOfYear(new Date(year, 11, 31));
      const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

      // Process reading history into daily data
      const dailyData: ReadingDay[] = allDays.map(date => {
        const dayBooks = history.filter((entry: any) => {
          if (!entry.endDate) return false;
          const endDate = entry.endDate instanceof Date ? entry.endDate : entry.endDate.toDate();
          return isSameDay(endDate, date) && entry.status === 'completed';
        });

        return {
          date,
          count: dayBooks.length,
          books: dayBooks.map((book: any) => book.title || book.bookTitle || 'Unknown Title')
        };
      });

      setReadingData(dailyData);
      calculateStats(dailyData);
    } catch (error) {
      console.error('Error loading reading data:', error);
      toast({
        title: "Error",
        description: "Failed to load reading data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: ReadingDay[]) => {
    const activeDays = data.filter(day => day.count > 0);
    const totalBooks = data.reduce((sum, day) => sum + day.count, 0);
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Start from the end (most recent) for current streak
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].count > 0) {
        tempStreak++;
        if (i === data.length - 1 || (i === data.length - 2 && data[data.length - 1].count === 0)) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    setStats({
      totalDays: activeDays.length,
      longestStreak,
      currentStreak,
      totalBooks
    });
  };

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 border-gray-200';
    if (count === 1) return 'bg-green-200 border-green-300';
    if (count === 2) return 'bg-green-300 border-green-400';
    if (count === 3) return 'bg-green-400 border-green-500';
    return 'bg-green-500 border-green-600';
  };

  const getIntensityLabel = (count: number) => {
    if (count === 0) return 'No books';
    if (count === 1) return '1 book';
    return `${count} books`;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year.toString());
    }
    return years;
  };

  const groupDataByWeeks = () => {
    const weeks: ReadingDay[][] = [];
    const firstDay = readingData[0]?.date;
    if (!firstDay) return weeks;

    // Get the first Sunday of the year (or the first day if it's not Sunday)
    const firstSunday = startOfWeek(firstDay, { weekStartsOn: 0 });
    
    for (let i = 0; i < 53; i++) { // Max 53 weeks in a year
      const weekStart = addWeeks(firstSunday, i);
      const week = [];
      
      for (let j = 0; j < 7; j++) {
        const dayData = readingData.find(d => 
          isSameDay(d.date, new Date(weekStart.getTime() + j * 24 * 60 * 60 * 1000))
        );
        if (dayData) {
          week.push(dayData);
        }
      }
      
      if (week.length > 0) {
        weeks.push(week);
      }
    }
    
    return weeks;
  };

  const weeks = groupDataByWeeks();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  if (!user) {
    return (
      <div className="text-center p-8">
        <p>Please log in to view your reading heatmap.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reading Heatmap</h2>
          <p className="text-muted-foreground">Visualize your reading activity throughout the year</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {generateYearOptions().map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Days</p>
                <p className="text-2xl font-bold">{stats.totalDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Books Read</p>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold">{stats.longestStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {selectedYear} Reading Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading heatmap...</div>
          ) : (
            <div className="space-y-4">
              {/* Month labels */}
              <div className="flex gap-1 text-xs text-muted-foreground mb-2">
                {months.map((month, index) => (
                  <div key={month} className="w-[52px] text-center">
                    {index % 2 === 0 ? month : ''}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <TooltipProvider>
                <div className="flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
                    <div className="h-3"></div>
                    <div className="h-3">Mon</div>
                    <div className="h-3"></div>
                    <div className="h-3">Wed</div>
                    <div className="h-3"></div>
                    <div className="h-3">Fri</div>
                    <div className="h-3"></div>
                  </div>

                  {/* Calendar grid */}
                  <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const dayData = week[dayIndex];
                          if (!dayData) {
                            return <div key={dayIndex} className="w-3 h-3" />;
                          }

                          return (
                            <Tooltip key={dayIndex}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-3 h-3 border rounded-sm cursor-pointer hover:ring-2 hover:ring-gray-400 ${getIntensityColor(dayData.count)}`}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-medium">
                                    {format(dayData.date, 'MMM dd, yyyy')}
                                  </div>
                                  <div className="text-sm">
                                    {getIntensityLabel(dayData.count)}
                                  </div>
                                  {dayData.books.length > 0 && (
                                    <div className="text-xs mt-1 max-w-48">
                                      {dayData.books.slice(0, 3).join(', ')}
                                      {dayData.books.length > 3 && `... +${dayData.books.length - 3} more`}
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipProvider>

              {/* Legend */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm" />
                  <div className="w-3 h-3 bg-green-200 border border-green-300 rounded-sm" />
                  <div className="w-3 h-3 bg-green-300 border border-green-400 rounded-sm" />
                  <div className="w-3 h-3 bg-green-400 border border-green-500 rounded-sm" />
                  <div className="w-3 h-3 bg-green-500 border border-green-600 rounded-sm" />
                </div>
                <span>More</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
