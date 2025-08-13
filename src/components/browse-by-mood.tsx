'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookCard } from '@/components/book-card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Heart, 
  Sun, 
  Moon, 
  Coffee, 
  Mountain, 
  Waves, 
  Sparkles, 
  Zap, 
  Leaf, 
  BookOpen,
  Search,
  Filter,
  Palette,
  Smile,
  ThumbsUp
} from 'lucide-react'
import { Book as BookType } from '@/lib/types'

interface Mood {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  gradient: string
  keywords: string[]
}

interface Theme {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  gradient: string
  subgenres: string[]
}

interface MoodThemeBook {
  id: string
  book: BookType
  moods: string[]
  themes: string[]
  vibeScore: number
  tags: string[]
}

const moods: Mood[] = [
  {
    id: 'cozy',
    name: 'Cozy & Comforting',
    description: 'Perfect for lazy Sunday afternoons and rainy days',
    icon: Coffee,
    color: 'bg-amber-500',
    gradient: 'from-amber-100 to-orange-100',
    keywords: ['comfort', 'heartwarming', 'gentle', 'soothing', 'peaceful']
  },
  {
    id: 'adventure',
    name: 'Adventure & Excitement',
    description: 'Heart-pounding stories that keep you on the edge',
    icon: Mountain,
    color: 'bg-green-500',
    gradient: 'from-green-100 to-emerald-100',
    keywords: ['thrilling', 'action', 'epic', 'journey', 'quest']
  },
  {
    id: 'romantic',
    name: 'Romantic & Dreamy',
    description: 'Love stories that make your heart flutter',
    icon: Heart,
    color: 'bg-pink-500',
    gradient: 'from-pink-100 to-rose-100',
    keywords: ['love', 'romance', 'passion', 'relationships', 'emotion']
  },
  {
    id: 'dark',
    name: 'Dark & Mysterious',
    description: 'Dive into shadows and explore the unknown',
    icon: Moon,
    color: 'bg-purple-500',
    gradient: 'from-purple-100 to-indigo-100',
    keywords: ['mystery', 'suspense', 'thriller', 'dark', 'psychological']
  },
  {
    id: 'uplifting',
    name: 'Uplifting & Inspiring',
    description: 'Stories that lift your spirits and motivate',
    icon: Sun,
    color: 'bg-yellow-500',
    gradient: 'from-yellow-100 to-amber-100',
    keywords: ['inspiring', 'hopeful', 'motivational', 'positive', 'upbeat']
  },
  {
    id: 'contemplative',
    name: 'Deep & Contemplative',
    description: 'Thought-provoking reads for quiet reflection',
    icon: Leaf,
    color: 'bg-teal-500',
    gradient: 'from-teal-100 to-cyan-100',
    keywords: ['philosophical', 'deep', 'reflective', 'meaningful', 'profound']
  },
  {
    id: 'escapist',
    name: 'Pure Escapism',
    description: 'Transport yourself to another world entirely',
    icon: Sparkles,
    color: 'bg-violet-500',
    gradient: 'from-violet-100 to-purple-100',
    keywords: ['fantasy', 'magical', 'otherworldly', 'immersive', 'escape']
  },
  {
    id: 'energizing',
    name: 'Fast & Energizing',
    description: 'Quick reads that get your pulse racing',
    icon: Zap,
    color: 'bg-red-500',
    gradient: 'from-red-100 to-pink-100',
    keywords: ['fast-paced', 'energetic', 'quick', 'dynamic', 'exciting']
  }
]

const themes: Theme[] = [
  {
    id: 'beach-reads',
    name: 'Beach Reads',
    description: 'Light, breezy books perfect for vacation reading',
    icon: Waves,
    color: 'bg-blue-500',
    gradient: 'from-blue-100 to-cyan-100',
    subgenres: ['Contemporary Romance', 'Chick Lit', 'Light Mystery', 'Travel Fiction']
  },
  {
    id: 'dark-academia',
    name: 'Dark Academia',
    description: 'Gothic academia with secret societies and forbidden knowledge',
    icon: BookOpen,
    color: 'bg-slate-700',
    gradient: 'from-slate-100 to-gray-100',
    subgenres: ['Gothic', 'Literary Fiction', 'Mystery', 'Historical Fiction']
  },
  {
    id: 'cottagecore',
    name: 'Cottagecore',
    description: 'Simple living, rural aesthetics, and connection to nature',
    icon: Leaf,
    color: 'bg-green-600',
    gradient: 'from-green-50 to-emerald-50',
    subgenres: ['Pastoral Fiction', 'Historical Romance', 'Nature Writing', 'Cozy Mystery']
  },
  {
    id: 'space-opera',
    name: 'Space Opera',
    description: 'Epic science fiction adventures across galaxies',
    icon: Sparkles,
    color: 'bg-indigo-600',
    gradient: 'from-indigo-100 to-purple-100',
    subgenres: ['Hard Sci-Fi', 'Military Sci-Fi', 'Space Adventure', 'Cyberpunk']
  },
  {
    id: 'urban-fantasy',
    name: 'Urban Fantasy',
    description: 'Magic and supernatural in modern city settings',
    icon: Zap,
    color: 'bg-purple-600',
    gradient: 'from-purple-100 to-pink-100',
    subgenres: ['Paranormal Romance', 'Modern Fantasy', 'Supernatural Thriller', 'Witch Fiction']
  },
  {
    id: 'historical-epic',
    name: 'Historical Epics',
    description: 'Sweeping stories across significant historical periods',
    icon: Mountain,
    color: 'bg-amber-600',
    gradient: 'from-amber-100 to-yellow-100',
    subgenres: ['Historical Fiction', 'War Stories', 'Period Romance', 'Cultural Saga']
  }
]

const mockMoodBooks: MoodThemeBook[] = [
  {
    id: '1',
    book: {
      id: 'mood-1',
      title: 'The House in the Cerulean Sea',
      author: 'TJ Klune',
      coverImage: 'https://covers.openlibrary.org/b/id/12360-L.jpg',
      status: 'plan-to-read',
      genre: 'Fantasy',
      description: 'A cozy fantasy about found family and magical creatures.',
      rating: 4.6
    },
    moods: ['cozy', 'uplifting', 'romantic'],
    themes: ['cottagecore'],
    vibeScore: 95,
    tags: ['found family', 'LGBTQ+', 'magical creatures', 'heartwarming']
  },
  {
    id: '2',
    book: {
      id: 'mood-2',
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      coverImage: 'https://covers.openlibrary.org/b/id/12361-L.jpg',
      status: 'plan-to-read',
      genre: 'Mystery',
      description: 'A psychological thriller about a woman who refuses to speak.',
      rating: 4.1
    },
    moods: ['dark', 'contemplative'],
    themes: ['dark-academia'],
    vibeScore: 88,
    tags: ['psychological', 'twist ending', 'unreliable narrator', 'mental health']
  },
  {
    id: '3',
    book: {
      id: 'mood-3',
      title: 'Beach Read',
      author: 'Emily Henry',
      coverImage: 'https://covers.openlibrary.org/b/id/12362-L.jpg',
      status: 'plan-to-read',
      genre: 'Romance',
      description: 'Enemies-to-lovers romance between two rival writers.',
      rating: 4.4
    },
    moods: ['romantic', 'uplifting', 'energizing'],
    themes: ['beach-reads'],
    vibeScore: 92,
    tags: ['enemies to lovers', 'writers', 'summer romance', 'witty banter']
  },
  {
    id: '4',
    book: {
      id: 'mood-4',
      title: 'Dune',
      author: 'Frank Herbert',
      coverImage: 'https://covers.openlibrary.org/b/id/12363-L.jpg',
      status: 'plan-to-read',
      genre: 'Science Fiction',
      description: 'Epic space opera about politics, religion, and ecology.',
      rating: 4.3
    },
    moods: ['adventure', 'contemplative', 'escapist'],
    themes: ['space-opera'],
    vibeScore: 91,
    tags: ['epic', 'politics', 'desert planet', 'chosen one']
  }
]

export default function BrowseByMood() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBooks, setFilteredBooks] = useState<MoodThemeBook[]>(mockMoodBooks)

  useEffect(() => {
    let filtered = mockMoodBooks

    if (selectedMoods.length > 0) {
      filtered = filtered.filter(book => 
        selectedMoods.some(mood => book.moods.includes(mood))
      )
    }

    if (selectedThemes.length > 0) {
      filtered = filtered.filter(book => 
        selectedThemes.some(theme => book.themes.includes(theme))
      )
    }

    if (searchQuery) {
      filtered = filtered.filter(book => 
        book.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort by vibe score
    filtered.sort((a, b) => b.vibeScore - a.vibeScore)

    setFilteredBooks(filtered)
  }, [selectedMoods, selectedThemes, searchQuery])

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    )
  }

  const toggleTheme = (themeId: string) => {
    setSelectedThemes(prev => 
      prev.includes(themeId) 
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse by Mood & Theme</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Discover books that match your current mood or explore captivating themes
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by book title, author, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="moods" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="moods" className="flex items-center gap-2">
            <Smile className="h-4 w-4" />
            Moods
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Themes
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            Results ({filteredBooks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moods" className="mt-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How are you feeling today?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Select one or more moods to find books that match your current state of mind
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {moods.map((mood) => {
                const Icon = mood.icon
                const isSelected = selectedMoods.includes(mood.id)
                
                return (
                  <Card 
                    key={mood.id} 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected 
                        ? `ring-2 ring-offset-2 ring-${mood.color.replace('bg-', '')}-500 bg-gradient-to-br ${mood.gradient}` 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => toggleMood(mood.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${mood.color} text-white mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{mood.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{mood.description}</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {mood.keywords.slice(0, 3).map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="themes" className="mt-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Explore Literary Themes</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Dive into specific literary themes and aesthetic movements
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => {
                const Icon = theme.icon
                const isSelected = selectedThemes.includes(theme.id)
                
                return (
                  <Card 
                    key={theme.id} 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected 
                        ? `ring-2 ring-offset-2 ring-purple-500 bg-gradient-to-br ${theme.gradient}` 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => toggleTheme(theme.id)}
                  >
                    <CardHeader>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${theme.color} text-white mb-2`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{theme.name}</CardTitle>
                      <CardDescription>{theme.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Popular Subgenres:</p>
                        <div className="flex flex-wrap gap-1">
                          {theme.subgenres.map((subgenre) => (
                            <Badge key={subgenre} variant="secondary" className="text-xs">
                              {subgenre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-8">
          {selectedMoods.length === 0 && selectedThemes.length === 0 && !searchQuery ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Filter className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to find your perfect book?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Select some moods or themes to discover books that match your preferences
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setSelectedMoods(['cozy'])}>
                    Try "Cozy" Mood
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedThemes(['dark-academia'])}>
                    Try "Dark Academia"
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>
              {/* Active Filters */}
              {(selectedMoods.length > 0 || selectedThemes.length > 0) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Active Filters:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMoods.map((moodId) => {
                      const mood = moods.find(m => m.id === moodId)
                      return mood ? (
                        <Badge 
                          key={moodId} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => toggleMood(moodId)}
                        >
                          {mood.name} ✕
                        </Badge>
                      ) : null
                    })}
                    {selectedThemes.map((themeId) => {
                      const theme = themes.find(t => t.id === themeId)
                      return theme ? (
                        <Badge 
                          key={themeId} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => toggleTheme(themeId)}
                        >
                          {theme.name} ✕
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Results */}
              {filteredBooks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No matches found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Try adjusting your mood and theme selections
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map((moodBook) => (
                    <div key={moodBook.id} className="space-y-3">
                      <BookCard book={moodBook.book} />
                      <Card className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Vibe Match</span>
                          <Badge variant="secondary">{moodBook.vibeScore}%</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {moodBook.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
