'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookCard } from '@/components/book-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Book, 
  Calendar, 
  MapPin, 
  Award, 
  ExternalLink, 
  Heart,
  Star,
  Quote,
  Globe,
  Mail,
  Twitter,
  Instagram,
  Users,
  BookOpen
} from 'lucide-react'
import { Book as BookType } from '@/lib/types'

interface Author {
  id: string
  name: string
  avatar: string
  bio: string
  birthDate: Date | null
  deathDate: Date | null
  birthPlace: string
  nationality: string
  genres: string[]
  website: string
  social: {
    twitter?: string
    instagram?: string
    goodreads?: string
  }
  awards: string[]
  totalBooks: number
  totalRatings: number
  averageRating: number
  followers: number
  isFollowing: boolean
}

interface AuthorBook {
  book: BookType
  publishedYear: number
  type: 'novel' | 'collection' | 'poetry' | 'nonfiction' | 'memoir'
  series?: string
  seriesOrder?: number
}

interface AuthorQuote {
  id: string
  text: string
  source: string
  category: 'writing' | 'life' | 'books' | 'inspiration'
}

interface AuthorNews {
  id: string
  title: string
  date: Date
  source: string
  type: 'award' | 'interview' | 'new-book' | 'event'
  excerpt: string
  url: string
}

const mockAuthor: Author = {
  id: 'toni-morrison',
  name: 'Toni Morrison',
  avatar: '/authors/toni-morrison.jpg',
  bio: 'Toni Morrison was an American novelist, essayist, book editor, and college professor. Her first novel, The Bluest Eye, was published in 1970. The critically acclaimed Song of Solomon (1977) brought her national attention and won the National Book Critics Circle Award. In 1988, Morrison won the Pulitzer Prize for Beloved (1987); she gained worldwide recognition when she was awarded the Nobel Prize in Literature in 1993.',
  birthDate: new Date('1931-02-18'),
  deathDate: new Date('2019-08-05'),
  birthPlace: 'Lorain, Ohio, USA',
  nationality: 'American',
  genres: ['Literary Fiction', 'Historical Fiction', 'African American Literature'],
  website: 'https://www.tonimorrison.com',
  social: {
    twitter: '@tonimorrison',
    goodreads: 'toni-morrison'
  },
  awards: [
    'Nobel Prize in Literature (1993)',
    'Pulitzer Prize for Fiction (1988)',
    'American Book Award (1977)',
    'National Book Critics Circle Award (1977)',
    'Presidential Medal of Freedom (2012)'
  ],
  totalBooks: 11,
  totalRatings: 234567,
  averageRating: 4.2,
  followers: 45892,
  isFollowing: false
}

const mockAuthorBooks: AuthorBook[] = [
  {
    book: {
      id: 'beloved',
      title: 'Beloved',
      author: 'Toni Morrison',
      coverImage: 'https://covers.openlibrary.org/b/id/12370-L.jpg',
      status: 'plan-to-read',
      genre: 'Literary Fiction',
      description: 'A haunting novel about slavery and its aftermath.',
      rating: 4.3
    },
    publishedYear: 1987,
    type: 'novel'
  },
  {
    book: {
      id: 'song-of-solomon',
      title: 'Song of Solomon',
      author: 'Toni Morrison',
      coverImage: 'https://covers.openlibrary.org/b/id/12371-L.jpg',
      status: 'plan-to-read',
      genre: 'Literary Fiction',
      description: 'A coming-of-age story exploring African American identity.',
      rating: 4.1
    },
    publishedYear: 1977,
    type: 'novel'
  },
  {
    book: {
      id: 'the-bluest-eye',
      title: 'The Bluest Eye',
      author: 'Toni Morrison',
      coverImage: 'https://covers.openlibrary.org/b/id/12372-L.jpg',
      status: 'plan-to-read',
      genre: 'Literary Fiction',
      description: 'Morrison\'s debut novel about beauty and self-worth.',
      rating: 4.0
    },
    publishedYear: 1970,
    type: 'novel'
  },
  {
    book: {
      id: 'sula',
      title: 'Sula',
      author: 'Toni Morrison',
      coverImage: 'https://covers.openlibrary.org/b/id/12373-L.jpg',
      status: 'plan-to-read',
      genre: 'Literary Fiction',
      description: 'A novel about friendship between two African American women.',
      rating: 3.9
    },
    publishedYear: 1973,
    type: 'novel'
  }
]

const mockQuotes: AuthorQuote[] = [
  {
    id: '1',
    text: 'If you want to fly, you have to give up the things that weigh you down.',
    source: 'Song of Solomon',
    category: 'inspiration'
  },
  {
    id: '2',
    text: 'The function, the very serious function of racism is distraction.',
    source: 'Interview (1975)',
    category: 'life'
  },
  {
    id: '3',
    text: 'If there\'s a book that you want to read, but it hasn\'t been written yet, then you must write it.',
    source: 'Speech at Ohio Arts Council (1981)',
    category: 'writing'
  },
  {
    id: '4',
    text: 'Love is or it ain\'t. Thin love ain\'t love at all.',
    source: 'Beloved',
    category: 'life'
  }
]

const mockNews: AuthorNews[] = [
  {
    id: '1',
    title: 'Toni Morrison\'s Literary Legacy Continues to Inspire New Generation of Writers',
    date: new Date('2024-01-15'),
    source: 'Literary Review',
    type: 'interview',
    excerpt: 'Five years after her passing, Morrison\'s influence on contemporary literature remains profound...',
    url: '#'
  },
  {
    id: '2',
    title: 'New Documentary Explores Toni Morrison\'s Creative Process',
    date: new Date('2023-12-20'),
    source: 'Publishers Weekly',
    type: 'event',
    excerpt: 'An upcoming documentary features never-before-seen interviews and archival footage...',
    url: '#'
  },
  {
    id: '3',
    title: 'Beloved Celebrates 35th Anniversary with Special Edition Release',
    date: new Date('2023-11-30'),
    source: 'Book News',
    type: 'new-book',
    excerpt: 'A special anniversary edition includes new essays and critical analysis...',
    url: '#'
  }
]

export default function AuthorProfile() {
  const [author, setAuthor] = useState<Author>(mockAuthor)
  const [authorBooks, setAuthorBooks] = useState<AuthorBook[]>(mockAuthorBooks)
  const [quotes, setQuotes] = useState<AuthorQuote[]>(mockQuotes)
  const [news, setNews] = useState<AuthorNews[]>(mockNews)
  const [sortBy, setSortBy] = useState<'year' | 'rating' | 'title'>('year')

  const sortedBooks = [...authorBooks].sort((a, b) => {
    switch (sortBy) {
      case 'year':
        return b.publishedYear - a.publishedYear
      case 'rating':
        return (b.book.rating || 0) - (a.book.rating || 0)
      case 'title':
        return a.book.title.localeCompare(b.book.title)
      default:
        return 0
    }
  })

  const getLifespan = () => {
    if (!author.birthDate) return 'Unknown'
    const birth = author.birthDate.getFullYear()
    const death = author.deathDate ? author.deathDate.getFullYear() : 'Present'
    return `${birth} - ${death}`
  }

  const getNewsIcon = (type: AuthorNews['type']) => {
    switch (type) {
      case 'award': return Award
      case 'interview': return Users
      case 'new-book': return BookOpen
      case 'event': return Calendar
      default: return Globe
    }
  }

  const getNewsColor = (type: AuthorNews['type']) => {
    switch (type) {
      case 'award': return 'text-yellow-600'
      case 'interview': return 'text-blue-600'
      case 'new-book': return 'text-green-600'
      case 'event': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Author Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="text-2xl">{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{author.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {author.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant={author.isFollowing ? "default" : "outline"}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`h-4 w-4 ${author.isFollowing ? 'fill-current' : ''}`} />
                    {author.isFollowing ? 'Following' : 'Follow Author'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{author.totalBooks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Books</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                    {author.averageRating}
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{author.totalRatings.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Ratings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{author.followers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Followers</div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{author.bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4">
          <TabsTrigger value="books">Bibliography</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Complete Works</CardTitle>
                  <CardDescription>
                    {author.totalBooks} published books
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={sortBy === 'year' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSortBy('year')}
                  >
                    By Year
                  </Button>
                  <Button 
                    variant={sortBy === 'rating' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSortBy('rating')}
                  >
                    By Rating
                  </Button>
                  <Button 
                    variant={sortBy === 'title' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSortBy('title')}
                  >
                    A-Z
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedBooks.map((authorBook) => (
                  <div key={authorBook.book.id} className="space-y-3">
                    <BookCard book={authorBook.book} />
                    <div className="text-center space-y-1">
                      <Badge variant="outline">{authorBook.publishedYear}</Badge>
                      <Badge variant="secondary" className="ml-2">
                        {authorBook.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Lifespan:</span>
                  <span className="text-sm">{getLifespan()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Born:</span>
                  <span className="text-sm">{author.birthPlace}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Nationality:</span>
                  <span className="text-sm">{author.nationality}</span>
                </div>
                {author.website && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Website:</span>
                    <a href={author.website} className="text-sm text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      Official Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Awards & Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {author.awards.map((award, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{award}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {(author.social.twitter || author.social.instagram || author.social.goodreads) && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media & Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {author.social.twitter && (
                      <a href={`https://twitter.com/${author.social.twitter.replace('@', '')}`} 
                         className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <Twitter className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Twitter</span>
                        <span className="text-sm text-gray-600">{author.social.twitter}</span>
                      </a>
                    )}
                    {author.social.instagram && (
                      <a href={`https://instagram.com/${author.social.instagram.replace('@', '')}`} 
                         className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        <span className="text-sm font-medium">Instagram</span>
                        <span className="text-sm text-gray-600">{author.social.instagram}</span>
                      </a>
                    )}
                    {author.social.goodreads && (
                      <a href={`https://goodreads.com/author/show/${author.social.goodreads}`} 
                         className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                        <Book className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium">Goodreads</span>
                        <span className="text-sm text-gray-600">Author Profile</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5" />
                Famous Quotes
              </CardTitle>
              <CardDescription>
                Memorable words from {author.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quotes.map((quote) => (
                  <Card key={quote.id} className="bg-gray-50 dark:bg-gray-800">
                    <CardContent className="p-6">
                      <blockquote className="text-lg italic mb-4 leading-relaxed">
                        "{quote.text}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <cite className="text-sm text-gray-600 dark:text-gray-300">
                          — {quote.source}
                        </cite>
                        <Badge variant="outline" className="text-xs">
                          {quote.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Latest News & Updates</CardTitle>
              <CardDescription>
                Recent news, interviews, and events related to {author.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {news.map((article) => {
                  const Icon = getNewsIcon(article.type)
                  const colorClass = getNewsColor(article.type)
                  
                  return (
                    <div key={article.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <Icon className={`h-5 w-5 mt-1 ${colorClass}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg leading-tight">{article.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {article.type}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {article.source} • {article.date.toLocaleDateString()}
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={article.url} target="_blank" rel="noopener noreferrer">
                                Read More
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
