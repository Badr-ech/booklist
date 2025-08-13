'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookCard } from '@/components/book-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Calendar, Book, Award, Star } from 'lucide-react'
import { Book as BookType } from '@/lib/types'

interface Award {
  id: string
  name: string
  description: string
  category: string
  yearEstablished: number
  prestigious: boolean
}

interface AwardWinner {
  id: string
  book: BookType
  award: Award
  year: number
  category?: string
}

const awards: Award[] = [
  {
    id: 'pulitzer',
    name: 'Pulitzer Prize for Fiction',
    description: 'Prestigious American literary award for distinguished fiction',
    category: 'Literary Fiction',
    yearEstablished: 1948,
    prestigious: true
  },
  {
    id: 'hugo',
    name: 'Hugo Award for Best Novel',
    description: 'Science fiction and fantasy literature excellence',
    category: 'Science Fiction & Fantasy',
    yearEstablished: 1953,
    prestigious: true
  },
  {
    id: 'nebula',
    name: 'Nebula Award for Best Novel',
    description: 'Science fiction and fantasy writers peer recognition',
    category: 'Science Fiction & Fantasy',
    yearEstablished: 1965,
    prestigious: true
  },
  {
    id: 'booker',
    name: 'Booker Prize',
    description: 'Leading literary prize for English-language fiction',
    category: 'Literary Fiction',
    yearEstablished: 1969,
    prestigious: true
  },
  {
    id: 'nationalbook',
    name: 'National Book Award',
    description: 'American literary prize recognizing outstanding writing',
    category: 'General Fiction',
    yearEstablished: 1950,
    prestigious: true
  },
  {
    id: 'newbery',
    name: 'Newbery Medal',
    description: 'Excellence in American children\'s literature',
    category: 'Children\'s Literature',
    yearEstablished: 1922,
    prestigious: true
  },
  {
    id: 'caldecott',
    name: 'Caldecott Medal',
    description: 'Distinguished American picture book for children',
    category: 'Picture Books',
    yearEstablished: 1938,
    prestigious: true
  },
  {
    id: 'world-fantasy',
    name: 'World Fantasy Award',
    description: 'Fantasy literature achievement recognition',
    category: 'Fantasy',
    yearEstablished: 1975,
    prestigious: false
  },
  {
    id: 'edgar',
    name: 'Edgar Award',
    description: 'Mystery Writers of America excellence awards',
    category: 'Mystery & Thriller',
    yearEstablished: 1946,
    prestigious: false
  },
  {
    id: 'costa',
    name: 'Costa Book Awards',
    description: 'British literary awards for poetry and fiction',
    category: 'Literary Fiction',
    yearEstablished: 1971,
    prestigious: false
  }
]

// Mock award winners data - in real app this would come from API
const mockAwardWinners: AwardWinner[] = [
  {
    id: '1',
    book: {
      id: 'pulitzer-2023',
      title: 'Demon Copperhead',
      author: 'Barbara Kingsolver',
      coverImage: 'https://covers.openlibrary.org/b/id/12345-L.jpg',
      status: 'plan-to-read',
      genre: 'Literary Fiction',
      description: 'A novel inspired by Charles Dickens\' David Copperfield, set in modern-day Appalachia.',
      rating: 4.2
    },
    award: awards[0],
    year: 2023
  },
  {
    id: '2',
    book: {
      id: 'hugo-2023',
      title: 'Nettle & Bone',
      author: 'T. Kingfisher',
      coverImage: 'https://covers.openlibrary.org/b/id/12346-L.jpg',
      status: 'plan-to-read',
      genre: 'Fantasy',
      description: 'A dark fairy tale about a nun who must save her sister from an abusive prince.',
      rating: 4.5
    },
    award: awards[1],
    year: 2023
  },
  {
    id: '3',
    book: {
      id: 'booker-2023',
      title: 'Prophet Song',
      author: 'Paul Lynch',
      coverImage: 'https://covers.openlibrary.org/b/id/12347-L.jpg',
      status: 'plan-to-read',
      genre: 'Literary Fiction',
      description: 'A dystopian novel about a mother trying to protect her family in a totalitarian Ireland.',
      rating: 4.1
    },
    award: awards[3],
    year: 2023
  },
  {
    id: '4',
    book: {
      id: 'newbery-2023',
      title: 'The Last Cuentista',
      author: 'Donna Barba Higuera',
      coverImage: 'https://covers.openlibrary.org/b/id/12348-L.jpg',
      status: 'plan-to-read',
      genre: 'Children\'s Literature',
      description: 'A sci-fi adventure about a girl who awakens on a space ship and must preserve human stories.',
      rating: 4.3
    },
    award: awards[5],
    year: 2022
  }
]

export default function AwardWinners() {
  const [selectedAward, setSelectedAward] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [filteredWinners, setFilteredWinners] = useState<AwardWinner[]>(mockAwardWinners)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  useEffect(() => {
    let filtered = mockAwardWinners

    if (selectedAward !== 'all') {
      filtered = filtered.filter(winner => winner.award.id === selectedAward)
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(winner => winner.year === parseInt(selectedYear))
    }

    setFilteredWinners(filtered)
  }, [selectedAward, selectedYear])

  const prestigiousAwards = awards.filter(award => award.prestigious)
  const otherAwards = awards.filter(award => !award.prestigious)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Award Winners</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Discover books that have won prestigious literary awards and recognition
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Select value={selectedAward} onValueChange={setSelectedAward}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Select award" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Awards</SelectItem>
            {awards.map((award) => (
              <SelectItem key={award.id} value={award.id}>
                {award.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Awards Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Award className="h-6 w-6" />
          Literary Awards
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Prestigious Awards
              </CardTitle>
              <CardDescription>
                The most renowned and influential literary awards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prestigiousAwards.map((award) => (
                  <div key={award.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium">{award.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{award.category}</p>
                    </div>
                    <Badge variant="secondary">
                      Est. {award.yearEstablished}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-blue-600" />
                Genre-Specific Awards
              </CardTitle>
              <CardDescription>
                Awards recognizing excellence in specific genres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {otherAwards.map((award) => (
                  <div key={award.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium">{award.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{award.category}</p>
                    </div>
                    <Badge variant="outline">
                      Est. {award.yearEstablished}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Award Winners */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Recent Winners
          {(selectedAward !== 'all' || selectedYear !== 'all') && (
            <Badge variant="secondary" className="ml-2">
              {filteredWinners.length} books
            </Badge>
          )}
        </h2>

        {filteredWinners.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No winners found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your filters to see more award-winning books.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWinners.map((winner) => (
              <div key={winner.id} className="space-y-3">
                <BookCard book={winner.book} />
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">
                      {winner.award.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-yellow-700 dark:text-yellow-300">
                    <span>{winner.year} Winner</span>
                    <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                      {winner.award.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            <Trophy className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Discover Award-Winning Literature
            </h3>
            <p className="text-blue-700 dark:text-blue-200 mb-6 max-w-2xl mx-auto">
              Explore books that have been recognized for their exceptional quality, 
              literary merit, and cultural impact by prestigious award committees.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Browse All Winners
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
