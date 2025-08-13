'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  BookOpen, 
  Calendar, 
  Clock,
  Target,
  TrendingUp,
  Plus,
  Edit3,
  Check,
  Pause,
  Play,
  BarChart3,
  PieChart,
  Timer,
  Award
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

interface ReadingSession {
  id: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  bookCover: string
  startPage: number
  endPage: number
  startTime: Date
  endTime: Date
  duration: number // in minutes
  notes?: string
  mood: 'excited' | 'focused' | 'relaxed' | 'contemplative' | 'challenged'
}

interface BookProgress {
  id: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  bookCover: string
  totalPages: number
  currentPage: number
  startDate: Date
  targetDate?: Date
  status: 'reading' | 'paused' | 'completed' | 'dnf'
  sessions: ReadingSession[]
  notes: string[]
  rating?: number
}

interface ReadingGoal {
  id: string
  type: 'books' | 'pages' | 'minutes'
  target: number
  current: number
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: Date
  endDate: Date
  description: string
}

const mockProgress: BookProgress[] = [
  {
    id: '1',
    bookId: 'dune',
    bookTitle: 'Dune',
    bookAuthor: 'Frank Herbert',
    bookCover: '/books/dune.jpg',
    totalPages: 688,
    currentPage: 245,
    startDate: new Date('2024-01-01'),
    targetDate: new Date('2024-02-15'),
    status: 'reading',
    sessions: [
      {
        id: 's1',
        bookId: 'dune',
        bookTitle: 'Dune',
        bookAuthor: 'Frank Herbert',
        bookCover: '/books/dune.jpg',
        startPage: 220,
        endPage: 245,
        startTime: new Date('2024-01-15T19:00:00'),
        endTime: new Date('2024-01-15T20:30:00'),
        duration: 90,
        mood: 'focused',
        notes: 'Really getting into the political intrigue'
      }
    ],
    notes: ['Amazing world-building', 'Complex political dynamics']
  },
  {
    id: '2',
    bookId: 'sapiens',
    bookTitle: 'Sapiens: A Brief History of Humankind',
    bookAuthor: 'Yuval Noah Harari',
    bookCover: '/books/sapiens.jpg',
    totalPages: 443,
    currentPage: 443,
    startDate: new Date('2023-12-01'),
    targetDate: new Date('2024-01-01'),
    status: 'completed',
    sessions: [],
    notes: ['Mind-blowing perspective on human history', 'Changed how I think about civilization'],
    rating: 5
  },
  {
    id: '3',
    bookId: 'atomic-habits',
    bookTitle: 'Atomic Habits',
    bookAuthor: 'James Clear',
    bookCover: '/books/atomic-habits.jpg',
    totalPages: 320,
    currentPage: 150,
    startDate: new Date('2024-01-10'),
    status: 'paused',
    sessions: [],
    notes: ['Great practical advice', 'Need to implement the 1% rule']
  }
]

const mockGoals: ReadingGoal[] = [
  {
    id: '1',
    type: 'books',
    target: 52,
    current: 8,
    period: 'yearly',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    description: 'Read 52 books this year'
  },
  {
    id: '2',
    type: 'pages',
    target: 50,
    current: 25,
    period: 'daily',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    description: 'Read 50 pages every day'
  },
  {
    id: '3',
    type: 'minutes',
    target: 60,
    current: 45,
    period: 'daily',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    description: 'Read for 60 minutes daily'
  }
]

const weeklyData = [
  { day: 'Mon', pages: 45, minutes: 65 },
  { day: 'Tue', pages: 52, minutes: 78 },
  { day: 'Wed', pages: 38, minutes: 45 },
  { day: 'Thu', pages: 61, minutes: 85 },
  { day: 'Fri', pages: 42, minutes: 55 },
  { day: 'Sat', pages: 73, minutes: 95 },
  { day: 'Sun', pages: 58, minutes: 72 }
]

const genreData = [
  { name: 'Fiction', value: 35, color: '#8884d8' },
  { name: 'Non-fiction', value: 25, color: '#82ca9d' },
  { name: 'Sci-Fi', value: 20, color: '#ffc658' },
  { name: 'Biography', value: 15, color: '#ff7c7c' },
  { name: 'Other', value: 5, color: '#8dd1e1' }
]

export default function ReadingProgressTracker() {
  const [progress, setProgress] = useState<BookProgress[]>(mockProgress)
  const [goals, setGoals] = useState<ReadingGoal[]>(mockGoals)
  const [activeTab, setActiveTab] = useState('current')
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false)
  const [showUpdateProgressDialog, setShowUpdateProgressDialog] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookProgress | null>(null)
  const [newGoal, setNewGoal] = useState({
    type: 'books' as ReadingGoal['type'],
    target: '',
    period: 'yearly' as ReadingGoal['period'],
    description: ''
  })
  const [pageUpdate, setPageUpdate] = useState({
    currentPage: '',
    sessionNotes: '',
    mood: 'focused' as ReadingSession['mood']
  })

  const updateProgress = (bookId: string, newPage: number, notes?: string, mood?: ReadingSession['mood']) => {
    setProgress(prev => prev.map(book => {
      if (book.id === bookId) {
        const session: ReadingSession = {
          id: Date.now().toString(),
          bookId: book.bookId,
          bookTitle: book.bookTitle,
          bookAuthor: book.bookAuthor,
          bookCover: book.bookCover,
          startPage: book.currentPage,
          endPage: newPage,
          startTime: new Date(),
          endTime: new Date(),
          duration: Math.floor(Math.random() * 60) + 30, // Mock duration
          mood: mood || 'focused',
          notes
        }

        const updatedBook = {
          ...book,
          currentPage: newPage,
          sessions: [...book.sessions, session],
          status: newPage >= book.totalPages ? 'completed' as const : book.status
        }

        if (notes) {
          updatedBook.notes = [...book.notes, notes]
        }

        return updatedBook
      }
      return book
    }))
  }

  const addGoal = () => {
    const goal: ReadingGoal = {
      id: Date.now().toString(),
      type: newGoal.type,
      target: parseInt(newGoal.target),
      current: 0,
      period: newGoal.period,
      startDate: new Date(),
      endDate: new Date(new Date().getFullYear() + 1, 0, 1),
      description: newGoal.description
    }

    setGoals(prev => [...prev, goal])
    setNewGoal({
      type: 'books',
      target: '',
      period: 'yearly',
      description: ''
    })
    setShowAddGoalDialog(false)
  }

  const handleUpdateProgress = () => {
    if (selectedBook && pageUpdate.currentPage) {
      updateProgress(
        selectedBook.id,
        parseInt(pageUpdate.currentPage),
        pageUpdate.sessionNotes || undefined,
        pageUpdate.mood
      )
      setPageUpdate({
        currentPage: '',
        sessionNotes: '',
        mood: 'focused'
      })
      setSelectedBook(null)
      setShowUpdateProgressDialog(false)
    }
  }

  const getProgressPercentage = (book: BookProgress) => {
    return Math.round((book.currentPage / book.totalPages) * 100)
  }

  const getGoalProgress = (goal: ReadingGoal) => {
    return Math.round((goal.current / goal.target) * 100)
  }

  const getStatusColor = (status: BookProgress['status']) => {
    switch (status) {
      case 'reading': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      case 'dnf': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const currentlyReading = progress.filter(book => book.status === 'reading')
  const recentlyCompleted = progress.filter(book => book.status === 'completed')
  const totalPagesRead = progress.reduce((sum, book) => sum + book.currentPage, 0)
  const totalBooks = progress.length
  const completedBooks = recentlyCompleted.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reading Progress</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Track your reading journey and achieve your goals
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBooks}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Books</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedBooks}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPagesRead.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pages Read</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentlyReading.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Currently Reading</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current Books</TabsTrigger>
          <TabsTrigger value="goals">Reading Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">Reading History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Currently Reading</h2>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          </div>

          <div className="grid gap-6">
            {currentlyReading.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{book.bookTitle}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">by {book.bookAuthor}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(book.status)} text-white`}>
                              {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                            </Badge>
                            {book.targetDate && (
                              <Badge variant="outline">
                                Due {book.targetDate.toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => {
                            setSelectedBook(book)
                            setPageUpdate(prev => ({ ...prev, currentPage: book.currentPage.toString() }))
                            setShowUpdateProgressDialog(true)
                          }}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Update Progress
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{book.currentPage} / {book.totalPages} pages ({getProgressPercentage(book)}%)</span>
                          </div>
                          <Progress value={getProgressPercentage(book)} className="h-2" />
                        </div>

                        {book.sessions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Latest Session:</p>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Pages {book.sessions[book.sessions.length - 1].startPage} - {book.sessions[book.sessions.length - 1].endPage}</span>
                                <span>{book.sessions[book.sessions.length - 1].duration} minutes</span>
                              </div>
                              {book.sessions[book.sessions.length - 1].notes && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {book.sessions[book.sessions.length - 1].notes}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Reading Goals</h2>
            <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Reading Goal</DialogTitle>
                  <DialogDescription>
                    Set a new reading goal to track your progress
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Goal Type</label>
                    <Select value={newGoal.type} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="pages">Pages</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target</label>
                    <Input
                      type="number"
                      placeholder="Enter target number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Period</label>
                    <Select value={newGoal.period} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, period: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      placeholder="Describe your goal"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={addGoal}
                      disabled={!newGoal.target || !newGoal.description}
                      className="flex-1"
                    >
                      Add Goal
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddGoalDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{goal.description}</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {goal.current} / {goal.target} {goal.type} ({goal.period})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{getGoalProgress(goal)}%</p>
                      <p className="text-sm text-gray-500">Complete</p>
                    </div>
                  </div>
                  <Progress value={getGoalProgress(goal)} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Started {goal.startDate.toLocaleDateString()}</span>
                    <span>Ends {goal.endDate.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Reading Activity</CardTitle>
                <CardDescription>Pages and minutes read this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="pages" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="minutes" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reading by Genre</CardTitle>
                <CardDescription>Distribution of books by genre</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {genreData.map((genre) => (
                    <div key={genre.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: genre.color }}
                      />
                      <span className="text-sm">{genre.name} ({genre.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">4.5 hrs</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Average daily reading</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">15 days</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Current streak</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">28 pages</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Average per day</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <h2 className="text-xl font-semibold">Reading History</h2>
          
          <div className="grid gap-4">
            {recentlyCompleted.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold mb-1">{book.bookTitle}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">by {book.bookAuthor}</p>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500 text-white">Completed</Badge>
                            <span className="text-sm text-gray-500">{book.totalPages} pages</span>
                            {book.rating && (
                              <div className="flex items-center gap-1">
                                {[...Array(book.rating)].map((_, i) => (
                                  <span key={i} className="text-yellow-400">★</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Finished {book.startDate.toLocaleDateString()}
                        </p>
                      </div>
                      {book.notes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Notes:</p>
                          <div className="space-y-1">
                            {book.notes.slice(0, 2).map((note, index) => (
                              <p key={index} className="text-sm text-gray-600 dark:text-gray-300">• {note}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Update Progress Dialog */}
      <Dialog open={showUpdateProgressDialog} onOpenChange={setShowUpdateProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Reading Progress</DialogTitle>
            <DialogDescription>
              {selectedBook && `Update your progress for "${selectedBook.bookTitle}"`}
            </DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Page</label>
                <Input
                  type="number"
                  min="0"
                  max={selectedBook.totalPages}
                  value={pageUpdate.currentPage}
                  onChange={(e) => setPageUpdate(prev => ({ ...prev, currentPage: e.target.value }))}
                  placeholder={`Enter page (max ${selectedBook.totalPages})`}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Session Notes (Optional)</label>
                <Input
                  value={pageUpdate.sessionNotes}
                  onChange={(e) => setPageUpdate(prev => ({ ...prev, sessionNotes: e.target.value }))}
                  placeholder="Add notes about this reading session..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Reading Mood</label>
                <Select 
                  value={pageUpdate.mood} 
                  onValueChange={(value: any) => setPageUpdate(prev => ({ ...prev, mood: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excited">Excited</SelectItem>
                    <SelectItem value="focused">Focused</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="contemplative">Contemplative</SelectItem>
                    <SelectItem value="challenged">Challenged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateProgress}
                  disabled={!pageUpdate.currentPage}
                  className="flex-1"
                >
                  Update Progress
                </Button>
                <Button variant="outline" onClick={() => setShowUpdateProgressDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
