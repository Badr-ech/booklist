'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookCard } from '@/components/book-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Users, BookOpen, Bookmark, Calendar, Quote } from 'lucide-react'
import { Book as BookType } from '@/lib/types'

interface StaffMember {
  id: string
  name: string
  title: string
  avatar: string
  bio: string
  favoriteGenres: string[]
  totalPicks: number
}

interface StaffPick {
  id: string
  book: BookType
  curator: StaffMember
  reason: string
  pickDate: Date
  category: 'new-releases' | 'hidden-gems' | 'classics' | 'seasonal' | 'trending'
  featured: boolean
}

const staffMembers: StaffMember[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    title: 'Literature Curator',
    avatar: '/avatars/sarah.jpg',
    bio: 'Passionate about contemporary fiction and emerging voices in literature.',
    favoriteGenres: ['Literary Fiction', 'Contemporary', 'Memoir'],
    totalPicks: 47
  },
  {
    id: 'marcus',
    name: 'Marcus Rivera',
    title: 'Genre Specialist',
    avatar: '/avatars/marcus.jpg',
    bio: 'Expert in science fiction, fantasy, and speculative fiction across all formats.',
    favoriteGenres: ['Science Fiction', 'Fantasy', 'Horror'],
    totalPicks: 52
  },
  {
    id: 'elena',
    name: 'Elena Volkov',
    title: 'International Books Editor',
    avatar: '/avatars/elena.jpg',
    bio: 'Dedicated to bringing diverse global voices and translated works to readers.',
    favoriteGenres: ['International Fiction', 'Poetry', 'Cultural Studies'],
    totalPicks: 38
  },
  {
    id: 'james',
    name: 'James Thompson',
    title: 'Non-Fiction Director',
    avatar: '/avatars/james.jpg',
    bio: 'Curates compelling non-fiction from history to science to personal development.',
    favoriteGenres: ['History', 'Science', 'Biography', 'Self-Help'],
    totalPicks: 43
  }
]

const mockStaffPicks: StaffPick[] = [
  {
    id: '1',
    book: {
      id: 'pick-1',
      title: 'The Seven Moons of Maali Almeida',
      author: 'Shehan Karunatilaka',
      coverImage: 'https://covers.openlibrary.org/b/id/12349-L.jpg',
      status: 'plan-to-read',
      genre: 'Literary Fiction',
      description: 'A darkly comic fantasy about a photographer who must solve his own murder from the afterlife.',
      rating: 4.3
    },
    curator: staffMembers[0],
    reason: 'A brilliantly imaginative take on death, war, and redemption. Karunatilaka\'s prose is both haunting and humorous, creating an unforgettable reading experience.',
    pickDate: new Date('2024-01-15'),
    category: 'hidden-gems',
    featured: true
  },
  {
    id: '2',
    book: {
      id: 'pick-2',
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      coverImage: 'https://covers.openlibrary.org/b/id/12350-L.jpg',
      status: 'plan-to-read',
      genre: 'Science Fiction',
      description: 'A story told from the perspective of an artificial friend observing human nature.',
      rating: 4.1
    },
    curator: staffMembers[1],
    reason: 'Ishiguro masterfully explores consciousness and love through the eyes of an AI companion. A profound meditation on what makes us human.',
    pickDate: new Date('2024-01-10'),
    category: 'new-releases',
    featured: true
  },
  {
    id: '3',
    book: {
      id: 'pick-3',
      title: 'The School for Good Mothers',
      author: 'Jessamine Chan',
      coverImage: 'https://covers.openlibrary.org/b/id/12351-L.jpg',
      status: 'plan-to-read',
      genre: 'Dystopian Fiction',
      description: 'A chilling look at surveillance, motherhood, and state control in near-future America.',
      rating: 4.2
    },
    curator: staffMembers[0],
    reason: 'Chan\'s debut is a terrifying yet necessary exploration of motherhood under surveillance. Timely and thought-provoking.',
    pickDate: new Date('2024-01-05'),
    category: 'trending',
    featured: false
  },
  {
    id: '4',
    book: {
      id: 'pick-4',
      title: 'Crying in H Mart',
      author: 'Michelle Zauner',
      coverImage: 'https://covers.openlibrary.org/b/id/12352-L.jpg',
      status: 'plan-to-read',
      genre: 'Memoir',
      description: 'A powerful memoir about identity, family, and grief through food and music.',
      rating: 4.5
    },
    curator: staffMembers[2],
    reason: 'Zauner\'s memoir is a beautiful exploration of grief, identity, and the foods that connect us to our heritage. Deeply moving and expertly crafted.',
    pickDate: new Date('2023-12-20'),
    category: 'classics',
    featured: false
  }
]

export default function StaffPicks() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCurator, setSelectedCurator] = useState<string>('all')
  const [filteredPicks, setFilteredPicks] = useState<StaffPick[]>(mockStaffPicks)

  useEffect(() => {
    let filtered = mockStaffPicks

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pick => pick.category === selectedCategory)
    }

    if (selectedCurator !== 'all') {
      filtered = filtered.filter(pick => pick.curator.id === selectedCurator)
    }

    setFilteredPicks(filtered)
  }, [selectedCategory, selectedCurator])

  const featuredPicks = mockStaffPicks.filter(pick => pick.featured)
  const categories = [
    { id: 'new-releases', label: 'New Releases', icon: BookOpen },
    { id: 'hidden-gems', label: 'Hidden Gems', icon: Star },
    { id: 'classics', label: 'Modern Classics', icon: Bookmark },
    { id: 'seasonal', label: 'Seasonal Picks', icon: Calendar },
    { id: 'trending', label: 'Trending Now', icon: Users }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Picks</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Carefully curated book recommendations from our expert literary team
        </p>
      </div>

      {/* Featured Picks */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-600" />
          Featured This Month
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredPicks.map((pick) => (
            <Card key={pick.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <BookCard book={pick.book} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={pick.curator.avatar} alt={pick.curator.name} />
                        <AvatarFallback>{pick.curator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{pick.curator.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{pick.curator.title}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {categories.find(c => c.id === pick.category)?.label}
                      </Badge>
                    </div>
                    <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-700 dark:text-gray-300">
                      "{pick.reason}"
                    </blockquote>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Staff Team */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Our Curators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffMembers.map((member) => (
            <Card key={member.id} className="text-center">
              <CardContent className="p-6">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-lg">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm mb-3">{member.title}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{member.bio}</p>
                <div className="flex flex-wrap gap-1 justify-center mb-3">
                  {member.favoriteGenres.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="outline" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {member.totalPicks} recommendations
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Picks */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          All Recommendations
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCurator} onValueChange={setSelectedCurator}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="All curators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Curators</SelectItem>
              {staffMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPicks.map((pick) => (
                <div key={pick.id} className="space-y-3">
                  <BookCard book={pick.book} />
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={pick.curator.avatar} alt={pick.curator.name} />
                        <AvatarFallback className="text-xs">{pick.curator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{pick.curator.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      "{pick.reason}"
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <div className="space-y-6">
              {filteredPicks.map((pick) => (
                <Card key={pick.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <img 
                          src={pick.book.coverImage} 
                          alt={pick.book.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{pick.book.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">by {pick.book.author}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {categories.find(c => c.id === pick.category)?.label}
                            </Badge>
                            {pick.featured && <Badge variant="secondary">Featured</Badge>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={pick.curator.avatar} alt={pick.curator.name} />
                            <AvatarFallback>{pick.curator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{pick.curator.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{pick.curator.title}</p>
                          </div>
                        </div>

                        <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-700 dark:text-gray-300 mb-3">
                          "{pick.reason}"
                        </blockquote>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Picked on {pick.pickDate.toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm">
                            Add to List
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
