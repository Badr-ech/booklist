'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Flame, 
  Calendar as CalendarIcon, 
  Target, 
  Award, 
  TrendingUp, 
  BookOpen,
  CheckCircle,
  Clock,
  Zap,
  Star,
  Trophy
} from 'lucide-react'

interface ReadingActivity {
  date: Date
  type: 'book_completed' | 'pages_read' | 'review_written' | 'note_added' | 'book_added'
  points: number
  description: string
  bookTitle?: string
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivity: Date | null
  totalActiveDays: number
  streakStartDate: Date | null
  streakEndDate: Date | null
}

interface StreakMilestone {
  days: number
  title: string
  description: string
  reward: string
  icon: React.ComponentType<{ className?: string }>
  achieved: boolean
}

const streakMilestones: StreakMilestone[] = [
  {
    days: 3,
    title: 'Getting Started',
    description: 'Keep the momentum going!',
    reward: 'Early Bird Badge',
    icon: Clock,
    achieved: true
  },
  {
    days: 7,
    title: 'One Week Warrior',
    description: 'A full week of reading activity',
    reward: '50 XP Bonus',
    icon: CheckCircle,
    achieved: true
  },
  {
    days: 14,
    title: 'Two Week Champion',
    description: 'Consistency is key to building habits',
    reward: 'Consistency Badge',
    icon: Target,
    achieved: false
  },
  {
    days: 30,
    title: 'Monthly Master',
    description: 'A full month of dedication',
    reward: 'Reading Streak Medal',
    icon: Award,
    achieved: false
  },
  {
    days: 50,
    title: 'Halfway Hero',
    description: 'Fifty days of consistent reading',
    reward: 'Special Profile Theme',
    icon: Star,
    achieved: false
  },
  {
    days: 100,
    title: 'Century Seeker',
    description: 'One hundred days of reading excellence',
    reward: 'Elite Reader Status',
    icon: Trophy,
    achieved: false
  },
  {
    days: 365,
    title: 'Year-Long Legend',
    description: 'A full year of reading dedication',
    reward: 'Master Reader Crown',
    icon: Flame,
    achieved: false
  }
]

const mockActivities: ReadingActivity[] = [
  {
    date: new Date('2024-01-08'),
    type: 'book_completed',
    points: 10,
    description: 'Completed "The Seven Husbands of Evelyn Hugo"',
    bookTitle: 'The Seven Husbands of Evelyn Hugo'
  },
  {
    date: new Date('2024-01-07'),
    type: 'pages_read',
    points: 5,
    description: 'Read 50 pages',
  },
  {
    date: new Date('2024-01-06'),
    type: 'review_written',
    points: 8,
    description: 'Wrote review for "Project Hail Mary"',
    bookTitle: 'Project Hail Mary'
  },
  {
    date: new Date('2024-01-05'),
    type: 'note_added',
    points: 3,
    description: 'Added note with favorite quote',
  },
  {
    date: new Date('2024-01-04'),
    type: 'book_added',
    points: 2,
    description: 'Added "Klara and the Sun" to reading list',
    bookTitle: 'Klara and the Sun'
  },
  {
    date: new Date('2024-01-03'),
    type: 'pages_read',
    points: 5,
    description: 'Read 75 pages',
  },
  {
    date: new Date('2024-01-02'),
    type: 'book_completed',
    points: 10,
    description: 'Completed "Circe"',
    bookTitle: 'Circe'
  }
]

const mockStreakData: StreakData = {
  currentStreak: 7,
  longestStreak: 12,
  lastActivity: new Date('2024-01-08'),
  totalActiveDays: 45,
  streakStartDate: new Date('2024-01-02'),
  streakEndDate: null
}

export default function ReadingStreaks() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [streakData, setStreakData] = useState<StreakData>(mockStreakData)
  const [activities, setActivities] = useState<ReadingActivity[]>(mockActivities)

  const today = new Date()
  const activeDates = activities.map(activity => activity.date)
  
  // Calculate next milestone
  const nextMilestone = streakMilestones.find(milestone => 
    !milestone.achieved && milestone.days > streakData.currentStreak
  )

  const progressToNext = nextMilestone 
    ? (streakData.currentStreak / nextMilestone.days) * 100
    : 100

  const getActivityTypeIcon = (type: ReadingActivity['type']) => {
    switch (type) {
      case 'book_completed': return CheckCircle
      case 'pages_read': return BookOpen
      case 'review_written': return Star
      case 'note_added': return Target
      case 'book_added': return Zap
      default: return BookOpen
    }
  }

  const getActivityTypeColor = (type: ReadingActivity['type']) => {
    switch (type) {
      case 'book_completed': return 'text-green-600'
      case 'pages_read': return 'text-blue-600'
      case 'review_written': return 'text-yellow-600'
      case 'note_added': return 'text-purple-600'
      case 'book_added': return 'text-pink-600'
      default: return 'text-gray-600'
    }
  }

  const isActiveDate = (date: Date) => {
    return activeDates.some(activeDate => 
      activeDate.toDateString() === date.toDateString()
    )
  }

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => 
      activity.date.toDateString() === date.toDateString()
    )
  }

  const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reading Streaks</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Track your daily reading habits and build consistent reading streaks
        </p>
      </div>

      {/* Current Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6 text-center">
            <Flame className="h-12 w-12 mx-auto text-orange-600 mb-3" />
            <div className="text-3xl font-bold text-orange-800 dark:text-orange-200 mb-1">
              {streakData.currentStreak}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-300">
              Current Streak
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-blue-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {streakData.longestStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Longest Streak
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-green-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {streakData.totalActiveDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Total Active Days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-12 w-12 mx-auto text-purple-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {totalPoints}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Total Points
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Milestone Progress */}
      {nextMilestone && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Next Milestone: {nextMilestone.title}
            </CardTitle>
            <CardDescription>
              {nextMilestone.days - streakData.currentStreak} more days to unlock "{nextMilestone.reward}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{streakData.currentStreak} days</span>
                <span>{nextMilestone.days} days</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {nextMilestone.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Reading Activity Calendar</CardTitle>
                <CardDescription>
                  Days with reading activity are highlighted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    active: activeDates
                  }}
                  modifiersStyles={{
                    active: { 
                      backgroundColor: '#f97316', 
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
                </CardTitle>
                <CardDescription>
                  Reading activities for this day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="space-y-4">
                    {getActivitiesForDate(selectedDate).length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 dark:text-gray-300">
                          No reading activity on this day
                        </p>
                      </div>
                    ) : (
                      getActivitiesForDate(selectedDate).map((activity, index) => {
                        const Icon = getActivityTypeIcon(activity.type)
                        const colorClass = getActivityTypeColor(activity.type)
                        
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Icon className={`h-5 w-5 ${colorClass}`} />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{activity.description}</p>
                              {activity.bookTitle && (
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                  {activity.bookTitle}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary">
                              +{activity.points} pts
                            </Badge>
                          </div>
                        )
                      })
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Click on a date to see activities
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Streak Milestones</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Unlock rewards by maintaining consistent reading habits
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streakMilestones.map((milestone) => {
                const Icon = milestone.icon
                const isNext = milestone === nextMilestone
                
                return (
                  <Card 
                    key={milestone.days}
                    className={`${
                      milestone.achieved 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : isNext
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                        : ''
                    }`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                        milestone.achieved 
                          ? 'bg-green-500 text-white' 
                          : isNext
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2">{milestone.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        {milestone.description}
                      </p>
                      
                      <div className="space-y-2">
                        <Badge 
                          variant={milestone.achieved ? "default" : isNext ? "secondary" : "outline"}
                          className="mb-2"
                        >
                          {milestone.days} days
                        </Badge>
                        
                        <div className="text-sm">
                          <p className="font-medium text-purple-600 dark:text-purple-400">
                            Reward: {milestone.reward}
                          </p>
                        </div>

                        {milestone.achieved && (
                          <Badge variant="default" className="bg-green-600">
                            ✓ Achieved
                          </Badge>
                        )}
                        
                        {isNext && (
                          <div className="mt-3">
                            <Progress 
                              value={(streakData.currentStreak / milestone.days) * 100} 
                              className="h-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {milestone.days - streakData.currentStreak} days to go
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest reading activities that contribute to your streak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = getActivityTypeIcon(activity.type)
                  const colorClass = getActivityTypeColor(activity.type)
                  
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Icon className={`h-6 w-6 ${colorClass}`} />
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        {activity.bookTitle && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {activity.bookTitle}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {activity.date.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        +{activity.points} pts
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Streak Tips */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Tips for Building Reading Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Daily Activities That Count:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Complete a book (10 points)
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  Write a review (8 points)
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Read pages (5 points)
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  Add notes/quotes (3 points)
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-pink-600" />
                  Add books to list (2 points)
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Streak Building Tips:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Set a daily reading goal, even if it's just 10 minutes</li>
                <li>• Keep a book with you for unexpected free time</li>
                <li>• Use audiobooks during commutes or workouts</li>
                <li>• Join reading challenges to stay motivated</li>
                <li>• Track your progress with notes and reviews</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
