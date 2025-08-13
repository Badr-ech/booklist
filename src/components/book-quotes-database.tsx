'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Quote, 
  Heart, 
  Share2, 
  BookOpen, 
  User, 
  Search, 
  Plus,
  Filter,
  Star,
  MessageCircle,
  Copy,
  ExternalLink,
  Bookmark
} from 'lucide-react'

interface BookQuote {
  id: string
  text: string
  author: string
  bookTitle: string
  bookId: string
  genre: string
  submittedBy: string
  submittedByEmail: string
  submittedByAvatar: string
  submittedAt: Date
  likes: number
  category: 'inspirational' | 'love' | 'wisdom' | 'humor' | 'philosophical' | 'motivational'
  isLiked: boolean
  isBookmarked: boolean
  pageNumber?: number
  chapter?: string
  verified: boolean
}

interface QuoteCategory {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  count: number
}

const categories: QuoteCategory[] = [
  {
    id: 'inspirational',
    name: 'Inspirational',
    description: 'Quotes that motivate and uplift',
    icon: Star,
    color: 'bg-yellow-500',
    count: 1247
  },
  {
    id: 'love',
    name: 'Love & Romance',
    description: 'Beautiful words about love and relationships',
    icon: Heart,
    color: 'bg-pink-500',
    count: 892
  },
  {
    id: 'wisdom',
    name: 'Wisdom',
    description: 'Profound insights and life lessons',
    icon: BookOpen,
    color: 'bg-blue-500',
    count: 1456
  },
  {
    id: 'humor',
    name: 'Humor',
    description: 'Witty and amusing quotes',
    icon: MessageCircle,
    color: 'bg-green-500',
    count: 634
  },
  {
    id: 'philosophical',
    name: 'Philosophical',
    description: 'Deep thoughts on existence and meaning',
    icon: Quote,
    color: 'bg-purple-500',
    count: 789
  },
  {
    id: 'motivational',
    name: 'Motivational',
    description: 'Quotes to drive action and achievement',
    icon: Plus,
    color: 'bg-orange-500',
    count: 923
  }
]

const mockQuotes: BookQuote[] = [
  {
    id: '1',
    text: 'It is our choices, Harry, that show what we truly are, far more than our abilities.',
    author: 'J.K. Rowling',
    bookTitle: 'Harry Potter and the Chamber of Secrets',
    bookId: 'hp2',
    genre: 'Fantasy',
    submittedBy: 'Sarah Johnson',
    submittedByEmail: 'sarah@email.com',
    submittedByAvatar: '/avatars/sarah.jpg',
    submittedAt: new Date('2024-01-10'),
    likes: 2847,
    category: 'wisdom',
    isLiked: true,
    isBookmarked: false,
    pageNumber: 333,
    chapter: 'The Very Secret Diary',
    verified: true
  },
  {
    id: '2',
    text: 'So we beat on, boats against the current, borne back ceaselessly into the past.',
    author: 'F. Scott Fitzgerald',
    bookTitle: 'The Great Gatsby',
    bookId: 'gatsby',
    genre: 'Literary Fiction',
    submittedBy: 'Michael Chen',
    submittedByEmail: 'mchen@email.com',
    submittedByAvatar: '/avatars/michael.jpg',
    submittedAt: new Date('2024-01-08'),
    likes: 1923,
    category: 'philosophical',
    isLiked: false,
    isBookmarked: true,
    pageNumber: 180,
    verified: true
  },
  {
    id: '3',
    text: 'I have not failed. I\'ve just found 10,000 ways that won\'t work.',
    author: 'Thomas Edison',
    bookTitle: 'Edison: A Biography',
    bookId: 'edison-bio',
    genre: 'Biography',
    submittedBy: 'Emma Wilson',
    submittedByEmail: 'ewilson@email.com',
    submittedByAvatar: '/avatars/emma.jpg',
    submittedAt: new Date('2024-01-05'),
    likes: 3156,
    category: 'motivational',
    isLiked: true,
    isBookmarked: true,
    pageNumber: 247,
    verified: true
  },
  {
    id: '4',
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    bookTitle: 'Steve Jobs',
    bookId: 'jobs-bio',
    genre: 'Biography',
    submittedBy: 'David Rodriguez',
    submittedByEmail: 'drodriguez@email.com',
    submittedByAvatar: '/avatars/david.jpg',
    submittedAt: new Date('2024-01-03'),
    likes: 4289,
    category: 'inspirational',
    isLiked: false,
    isBookmarked: false,
    verified: true
  },
  {
    id: '5',
    text: 'Love is or it ain\'t. Thin love ain\'t love at all.',
    author: 'Toni Morrison',
    bookTitle: 'Beloved',
    bookId: 'beloved',
    genre: 'Literary Fiction',
    submittedBy: 'Lisa Park',
    submittedByEmail: 'lpark@email.com',
    submittedByAvatar: '/avatars/lisa.jpg',
    submittedAt: new Date('2024-01-01'),
    likes: 2674,
    category: 'love',
    isLiked: true,
    isBookmarked: false,
    pageNumber: 164,
    verified: true
  }
]

export default function BookQuotesDatabase() {
  const [quotes, setQuotes] = useState<BookQuote[]>(mockQuotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alphabetical'>('popular')
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [newQuote, setNewQuote] = useState({
    text: '',
    author: '',
    bookTitle: '',
    category: 'inspirational' as BookQuote['category'],
    pageNumber: '',
    chapter: ''
  })

  const filteredQuotes = quotes
    .filter(quote => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          quote.text.toLowerCase().includes(query) ||
          quote.author.toLowerCase().includes(query) ||
          quote.bookTitle.toLowerCase().includes(query)
        )
      }
      if (selectedCategory !== 'all' && quote.category !== selectedCategory) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.submittedAt.getTime() - a.submittedAt.getTime()
        case 'popular':
          return b.likes - a.likes
        case 'alphabetical':
          return a.author.localeCompare(b.author)
        default:
          return 0
      }
    })

  const toggleLike = (quoteId: string) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === quoteId 
        ? { 
            ...quote, 
            isLiked: !quote.isLiked,
            likes: quote.isLiked ? quote.likes - 1 : quote.likes + 1
          }
        : quote
    ))
  }

  const toggleBookmark = (quoteId: string) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === quoteId 
        ? { ...quote, isBookmarked: !quote.isBookmarked }
        : quote
    ))
  }

  const copyQuote = async (quote: BookQuote) => {
    const text = `"${quote.text}" - ${quote.author}, ${quote.bookTitle}`
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const shareQuote = (quote: BookQuote) => {
    if (navigator.share) {
      navigator.share({
        title: `Quote from ${quote.bookTitle}`,
        text: `"${quote.text}" - ${quote.author}`,
        url: window.location.href
      })
    }
  }

  const submitQuote = () => {
    // In a real app, this would make an API call
    const quote: BookQuote = {
      id: Date.now().toString(),
      text: newQuote.text,
      author: newQuote.author,
      bookTitle: newQuote.bookTitle,
      bookId: 'new-book',
      genre: 'Unknown',
      submittedBy: 'Current User',
      submittedByEmail: 'user@email.com',
      submittedByAvatar: '/avatars/user.jpg',
      submittedAt: new Date(),
      likes: 0,
      category: newQuote.category,
      isLiked: false,
      isBookmarked: false,
      pageNumber: newQuote.pageNumber ? parseInt(newQuote.pageNumber) : undefined,
      chapter: newQuote.chapter || undefined,
      verified: false
    }
    
    setQuotes(prev => [quote, ...prev])
    setNewQuote({
      text: '',
      author: '',
      bookTitle: '',
      category: 'inspirational',
      pageNumber: '',
      chapter: ''
    })
    setShowSubmitDialog(false)
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.color : 'bg-gray-500'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Quote className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book Quotes</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Discover and share memorable quotes from your favorite books
        </p>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
                onClick={() => setSelectedCategory(isSelected ? 'all' : category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${category.color} text-white mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{category.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {category.count} quotes
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quotes by text, author, or book title..."
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
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="alphabetical">By Author</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Submit Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit a New Quote</DialogTitle>
              <DialogDescription>
                Share a memorable quote from a book you've read
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quote Text *</label>
                <Textarea
                  placeholder="Enter the quote text..."
                  value={newQuote.text}
                  onChange={(e) => setNewQuote(prev => ({ ...prev, text: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Author *</label>
                  <Input
                    placeholder="Author name"
                    value={newQuote.author}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, author: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Book Title *</label>
                  <Input
                    placeholder="Book title"
                    value={newQuote.bookTitle}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, bookTitle: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <Select value={newQuote.category} onValueChange={(value: any) => setNewQuote(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Page Number</label>
                  <Input
                    placeholder="Page number"
                    type="number"
                    value={newQuote.pageNumber}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, pageNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Chapter</label>
                  <Input
                    placeholder="Chapter name"
                    value={newQuote.chapter}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, chapter: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={submitQuote}
                  disabled={!newQuote.text || !newQuote.author || !newQuote.bookTitle}
                  className="flex-1"
                >
                  Submit Quote
                </Button>
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quote Results */}
      <div className="space-y-6">
        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Quote className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No quotes found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search terms or browse different categories
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => (
            <Card key={quote.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <blockquote className="text-lg leading-relaxed mb-4 italic">
                      "{quote.text}"
                    </blockquote>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <cite className="font-medium text-gray-900 dark:text-white not-italic">
                          — {quote.author}
                        </cite>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {quote.bookTitle}
                          {quote.pageNumber && ` (Page ${quote.pageNumber})`}
                          {quote.chapter && `, ${quote.chapter}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${getCategoryColor(quote.category)} text-white`}
                        >
                          {categories.find(c => c.id === quote.category)?.name}
                        </Badge>
                        <Badge variant="outline">{quote.genre}</Badge>
                        {quote.verified && (
                          <Badge variant="default" className="bg-green-600">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={quote.submittedByAvatar} alt={quote.submittedBy} />
                          <AvatarFallback>{quote.submittedBy.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{quote.submittedBy}</p>
                          <p className="text-xs text-gray-500">
                            {quote.submittedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(quote.id)}
                          className={`flex items-center gap-1 ${quote.isLiked ? 'text-red-600' : ''}`}
                        >
                          <Heart className={`h-4 w-4 ${quote.isLiked ? 'fill-current' : ''}`} />
                          {quote.likes}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(quote.id)}
                          className={`${quote.isBookmarked ? 'text-blue-600' : ''}`}
                        >
                          <Bookmark className={`h-4 w-4 ${quote.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyQuote(quote)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareQuote(quote)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Popular Authors */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Most Quoted Authors</CardTitle>
          <CardDescription>Authors with the most quotes in our database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['J.K. Rowling', 'Maya Angelou', 'Oscar Wilde', 'Mark Twain', 'Jane Austen', 'Shakespeare'].map((author) => (
              <div key={author} className="text-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <User className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="font-medium text-sm">{author}</p>
                <p className="text-xs text-gray-500">{Math.floor(Math.random() * 50) + 10} quotes</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
