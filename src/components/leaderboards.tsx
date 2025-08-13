'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  BookOpen, 
  MessageCircle, 
  Users, 
  Calendar,
  TrendingUp,
  Award,
  Target,
  Zap
} from 'lucide-react'

interface LeaderboardUser {
  id: string
  name: string
  email: string
  avatar: string
  rank: number
  score: number
  change: number // +1, -1, or 0 for rank change
  streak: number
  isFollowing: boolean
}

interface LeaderboardStats {
  category: string
  timeframe: string
  totalParticipants: number
  userRank: number
  userScore: number
}

const mockGlobalLeaderboard: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    avatar: '/avatars/sarah.jpg',
    rank: 1,
    score: 2847,
    change: 0,
    streak: 45,
    isFollowing: false
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    avatar: '/avatars/michael.jpg',
    rank: 2,
    score: 2634,
    change: 1,
    streak: 32,
    isFollowing: true
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'ewilson@email.com',
    avatar: '/avatars/emma.jpg',
    rank: 3,
    score: 2456,
    change: -1,
    streak: 28,
    isFollowing: false
  },
  {
    id: '4',
    name: 'David Rodriguez',
    email: 'drodriguez@email.com',
    avatar: '/avatars/david.jpg',
    rank: 4,
    score: 2289,
    change: 2,
    streak: 41,
    isFollowing: true
  },
  {
    id: '5',
    name: 'Lisa Park',
    email: 'lpark@email.com',
    avatar: '/avatars/lisa.jpg',
    rank: 5,
    score: 2156,
    change: 0,
    streak: 19,
    isFollowing: false
  }
]

const mockFriendsLeaderboard: LeaderboardUser[] = [
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    avatar: '/avatars/michael.jpg',
    rank: 1,
    score: 2634,
    change: 0,
    streak: 32,
    isFollowing: true
  },
  {
    id: '4',
    name: 'David Rodriguez',
    email: 'drodriguez@email.com',
    avatar: '/avatars/david.jpg',
    rank: 2,
    score: 2289,
    change: 1,
    streak: 41,
    isFollowing: true
  },
  {
    id: '6',
    name: 'You',
    email: 'user@email.com',
    avatar: '/avatars/you.jpg',
    rank: 3,
    score: 1847,
    change: -1,
    streak: 12,
    isFollowing: false
  }
]

const categories = [
  { id: 'books-read', label: 'Books Read', icon: BookOpen },
  { id: 'reviews-written', label: 'Reviews Written', icon: MessageCircle },
  { id: 'reading-streak', label: 'Reading Streak', icon: Zap },
  { id: 'total-points', label: 'Total Points', icon: Star },
  { id: 'goals-completed', label: 'Goals Completed', icon: Target }
]

const timeframes = [
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'yearly', label: 'This Year' },
  { id: 'all-time', label: 'All Time' }
]

export default function Leaderboards() {
  const [selectedCategory, setSelectedCategory] = useState('total-points')
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly')
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardUser[]>(mockGlobalLeaderboard)
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardUser[]>(mockFriendsLeaderboard)

  const getCurrentStats = (): LeaderboardStats => ({
    category: selectedCategory,
    timeframe: selectedTimeframe,
    totalParticipants: 1247,
    userRank: 87,
    userScore: 1847
  })

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-300">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700'
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-300 dark:border-gray-600'
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700'
      default:
        return ''
    }
  }

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          ↑{change}
        </Badge>
      )
    } else if (change < 0) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          ↓{Math.abs(change)}
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="text-gray-600">
          —
        </Badge>
      )
    }
  }

  const currentStats = getCurrentStats()
  const currentCategory = categories.find(cat => cat.id === selectedCategory)
  const currentTimeframe = timeframes.find(tf => tf.id === selectedTimeframe)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboards</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          See how you rank among readers in your network and globally
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((timeframe) => (
              <SelectItem key={timeframe.id} value={timeframe.id}>
                {timeframe.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Your Rank Overview */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Ranking
          </CardTitle>
          <CardDescription>
            {currentCategory?.label} • {currentTimeframe?.label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                #{currentStats.userRank}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Your Rank
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {currentStats.userScore.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Your Score
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">
                {currentStats.totalParticipants.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Participants
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Friends Only
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>
                Top performers across the entire platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {globalLeaderboard.map((user) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center gap-4 p-4 rounded-lg border ${getRankColor(user.rank)}`}
                  >
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(user.rank)}
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{user.name}</h3>
                        {user.isFollowing && (
                          <Badge variant="secondary" className="text-xs">
                            Following
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {user.streak} day streak
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {user.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        points
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {getChangeIndicator(user.change)}
                      {!user.isFollowing && user.id !== '6' && (
                        <Button variant="outline" size="sm">
                          Follow
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline">
                  View Full Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Friends Leaderboard
              </CardTitle>
              <CardDescription>
                Compete with your reading friends and followers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {friendsLeaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No friends on leaderboard
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Follow other readers to see how you compare with your reading network
                  </p>
                  <Button>
                    Discover Users to Follow
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendsLeaderboard.map((user) => (
                    <div 
                      key={user.id} 
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        user.name === 'You' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                          : getRankColor(user.rank)
                      }`}
                    >
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(user.rank)}
                      </div>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold truncate ${user.name === 'You' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            {user.name}
                          </h3>
                          {user.name === 'You' && (
                            <Badge className="bg-blue-600 text-white text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {user.streak} day streak
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {user.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          points
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {getChangeIndicator(user.change)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leaderboard Categories Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Rankings Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.id} className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">{category.label}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {category.id === 'books-read' && 'Total number of books completed'}
                      {category.id === 'reviews-written' && 'Number of reviews you\'ve written'}
                      {category.id === 'reading-streak' && 'Current consecutive days of reading activity'}
                      {category.id === 'total-points' && 'Combined points from all reading activities'}
                      {category.id === 'goals-completed' && 'Reading goals and challenges completed'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
