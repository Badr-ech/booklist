'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookCard } from '@/components/book-card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star, 
  Search, 
  Filter,
  Calendar,
  User,
  Award,
  TrendingUp,
  List,
  PlayCircle
} from 'lucide-react'
import { Book as BookType } from '@/lib/types'

interface Series {
  id: string
  title: string
  author: string
  description: string
  totalBooks: number
  completedBooks: number
  genre: string
  averageRating: number
  totalRatings: number
  status: 'ongoing' | 'completed' | 'hiatus'
  startYear: number
  endYear?: number
  coverImage: string
  isFollowing: boolean
}

interface SeriesBook {
  book: BookType
  seriesOrder: number
  isRead: boolean
  userRating?: number
  readDate?: Date
}

interface SeriesProgress {
  seriesId: string
  totalBooks: number
  readBooks: number
  currentBook?: SeriesBook
  nextBook?: SeriesBook
  progressPercentage: number
}

const mockSeries: Series[] = [
  {
    id: 'harry-potter',
    title: 'Harry Potter',
    author: 'J.K. Rowling',
    description: 'Follow the magical journey of Harry Potter as he discovers his wizarding heritage and battles the dark wizard Voldemort.',
    totalBooks: 7,
    completedBooks: 7,
    genre: 'Fantasy',
    averageRating: 4.5,
    totalRatings: 1234567,
    status: 'completed',
    startYear: 1997,
    endYear: 2007,
    coverImage: 'https://covers.openlibrary.org/b/id/12390-L.jpg',
    isFollowing: true
  },
  {
    id: 'dune-chronicles',
    title: 'Dune Chronicles',
    author: 'Frank Herbert',
    description: 'Epic science fiction saga set in a distant future amidst a feudal interstellar society.',
    totalBooks: 6,
    completedBooks: 6,
    genre: 'Science Fiction',
    averageRating: 4.2,
    totalRatings: 456789,
    status: 'completed',
    startYear: 1965,
    endYear: 1985,
    coverImage: 'https://covers.openlibrary.org/b/id/12391-L.jpg',
    isFollowing: false
  },
  {
    id: 'stormlight-archive',
    title: 'The Stormlight Archive',
    author: 'Brandon Sanderson',
    description: 'Epic fantasy series set on the storm-ravaged world of Roshar.',
    totalBooks: 10,
    completedBooks: 4,
    genre: 'Fantasy',
    averageRating: 4.7,
    totalRatings: 234567,
    status: 'ongoing',
    startYear: 2010,
    coverImage: 'https://covers.openlibrary.org/b/id/12392-L.jpg',
    isFollowing: true
  },
  {
    id: 'expanse',
    title: 'The Expanse',
    author: 'James S.A. Corey',
    description: 'Space opera series set in a future where humanity has colonized the Solar System.',
    totalBooks: 9,
    completedBooks: 9,
    genre: 'Science Fiction',
    averageRating: 4.4,
    totalRatings: 345678,
    status: 'completed',
    startYear: 2011,
    endYear: 2021,
    coverImage: 'https://covers.openlibrary.org/b/id/12393-L.jpg',
    isFollowing: false
  }
]

const mockSeriesBooks: { [key: string]: SeriesBook[] } = {
  'harry-potter': [
    {
      book: {
        id: 'hp1',
        title: 'Harry Potter and the Philosopher\'s Stone',
        author: 'J.K. Rowling',
        coverImage: 'https://covers.openlibrary.org/b/id/12400-L.jpg',
        status: 'completed',
        genre: 'Fantasy',
        description: 'Harry discovers he\'s a wizard on his 11th birthday.',
        rating: 4.6
      },
      seriesOrder: 1,
      isRead: true,
      userRating: 5,
      readDate: new Date('2023-01-15')
    },
    {
      book: {
        id: 'hp2',
        title: 'Harry Potter and the Chamber of Secrets',
        author: 'J.K. Rowling',
        coverImage: 'https://covers.openlibrary.org/b/id/12401-L.jpg',
        status: 'completed',
        genre: 'Fantasy',
        description: 'Harry\'s second year at Hogwarts brings new mysteries.',
        rating: 4.4
      },
      seriesOrder: 2,
      isRead: true,
      userRating: 4,
      readDate: new Date('2023-02-20')
    },
    {
      book: {
        id: 'hp3',
        title: 'Harry Potter and the Prisoner of Azkaban',
        author: 'J.K. Rowling',
        coverImage: 'https://covers.openlibrary.org/b/id/12402-L.jpg',
        status: 'reading',
        genre: 'Fantasy',
        description: 'Harry learns about his past and Sirius Black.',
        rating: 4.5
      },
      seriesOrder: 3,
      isRead: false,
      readDate: undefined
    }
  ]
}

export default function BookSeriesManagement() {
  const [series, setSeries] = useState<Series[]>(mockSeries)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'rating' | 'year'>('title')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed' | 'following'>('all')
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null)

  const filteredSeries = series
    .filter(s => {
      if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !s.author.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (filterStatus === 'ongoing' && s.status !== 'ongoing') return false
      if (filterStatus === 'completed' && s.status !== 'completed') return false
      if (filterStatus === 'following' && !s.isFollowing) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'rating':
          return b.averageRating - a.averageRating
        case 'year':
          return b.startYear - a.startYear
        default:
          return 0
      }
    })

  const getSeriesProgress = (series: Series): SeriesProgress => {
    const books = mockSeriesBooks[series.id] || []
    const readBooks = books.filter(b => b.isRead).length
    const currentBook = books.find(b => !b.isRead)
    const nextBookIndex = books.findIndex(b => !b.isRead)
    const nextBook = nextBookIndex !== -1 && nextBookIndex < books.length - 1 ? books[nextBookIndex + 1] : undefined

    return {
      seriesId: series.id,
      totalBooks: series.totalBooks,
      readBooks,
      currentBook,
      nextBook,
      progressPercentage: (readBooks / series.totalBooks) * 100
    }
  }

  const getStatusColor = (status: Series['status']) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'hiatus':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <List className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book Series</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Discover, track, and organize your reading progress across book series
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search series by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="author">Author A-Z</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="year">Newest First</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Series</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="following">Following</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeries.map((series) => {
              const progress = getSeriesProgress(series)
              
              return (
                <Card key={series.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedSeries(series)}>
                  <CardContent className="p-6">
                    <div className="flex gap-4 mb-4">
                      <img 
                        src={series.coverImage} 
                        alt={series.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1 truncate">{series.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">by {series.author}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{series.genre}</Badge>
                          <Badge className={getStatusColor(series.status)}>
                            {series.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{series.averageRating}</span>
                          <span className="text-gray-500">({series.totalRatings.toLocaleString()})</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Reading Progress</span>
                          <span>{progress.readBooks}/{series.totalBooks} books</span>
                        </div>
                        <Progress value={progress.progressPercentage} className="h-2" />
                      </div>

                      {progress.currentBook && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <PlayCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Currently Reading</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            Book {progress.currentBook.seriesOrder}: {progress.currentBook.book.title}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          variant={series.isFollowing ? "default" : "outline"} 
                          size="sm" 
                          className="flex-1"
                        >
                          {series.isFollowing ? 'Following' : 'Follow Series'}
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {filteredSeries.map((series, index) => {
                const progress = getSeriesProgress(series)
                
                return (
                  <div 
                    key={series.id} 
                    className={`p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                      index === 0 ? 'rounded-t-lg' : ''
                    } ${index === filteredSeries.length - 1 ? 'rounded-b-lg' : ''}`}
                    onClick={() => setSelectedSeries(series)}
                  >
                    <div className="flex gap-6">
                      <img 
                        src={series.coverImage} 
                        alt={series.title}
                        className="w-16 h-24 object-cover rounded flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-xl mb-1">{series.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">by {series.author}</p>
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline">{series.genre}</Badge>
                              <Badge className={getStatusColor(series.status)}>
                                {series.status}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span>{series.averageRating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant={series.isFollowing ? "default" : "outline"} 
                              size="sm"
                            >
                              {series.isFollowing ? 'Following' : 'Follow'}
                            </Button>
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {series.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{progress.readBooks}/{series.totalBooks} books</span>
                            </div>
                            <Progress value={progress.progressPercentage} className="h-2" />
                          </div>

                          {progress.currentBook && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <PlayCircle className="h-3 w-3 text-blue-600" />
                                <span className="text-xs font-medium">Currently Reading</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                Book {progress.currentBook.seriesOrder}: {progress.currentBook.book.title}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {series.startYear}{series.endYear ? ` - ${series.endYear}` : ' - ongoing'}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {series.totalBooks} books
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Series Detail Modal */}
      {selectedSeries && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedSeries.title}</CardTitle>
                  <CardDescription className="text-lg">by {selectedSeries.author}</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedSeries(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <img 
                    src={selectedSeries.coverImage} 
                    alt={selectedSeries.title}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                  <div className="mt-4 space-y-2">
                    <Badge variant="outline" className="w-full justify-center">{selectedSeries.genre}</Badge>
                    <Badge className={`w-full justify-center ${getStatusColor(selectedSeries.status)}`}>
                      {selectedSeries.status}
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-700 dark:text-gray-300 mb-6">{selectedSeries.description}</p>
                  
                  {mockSeriesBooks[selectedSeries.id] && (
                    <div>
                      <h4 className="font-semibold text-lg mb-4">Books in Series</h4>
                      <div className="space-y-4">
                        {mockSeriesBooks[selectedSeries.id].map((seriesBook) => (
                          <div key={seriesBook.book.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                              <span className="text-sm font-bold text-blue-600">{seriesBook.seriesOrder}</span>
                            </div>
                            <img 
                              src={seriesBook.book.coverImage} 
                              alt={seriesBook.book.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium">{seriesBook.book.title}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                {seriesBook.book.description}
                              </p>
                              {seriesBook.isRead && seriesBook.readDate && (
                                <p className="text-xs text-green-600">
                                  Read on {seriesBook.readDate.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {seriesBook.isRead ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                              {seriesBook.userRating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm">{seriesBook.userRating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
