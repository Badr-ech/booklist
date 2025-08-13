import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles, Award, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function DiscoverSection() {
  const trendingBooks = [
    {
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      cover: "https://placehold.co/120x180.png",
      trending: true
    },
    {
      title: "Fourth Wing",
      author: "Rebecca Ross",
      cover: "https://placehold.co/120x180.png",
      trending: true
    },
    {
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      author: "Gabrielle Zevin",
      cover: "https://placehold.co/120x180.png",
      trending: true
    },
    {
      title: "The Atlas Six",
      author: "Olivie Blake",
      cover: "https://placehold.co/120x180.png",
      trending: true
    }
  ];

  const features = [
    {
      title: "Trending Now",
      icon: TrendingUp,
      description: "See what books are popular this week",
      href: "/trending",
      color: "text-orange-600"
    },
    {
      title: "AI Recommendations",
      icon: Sparkles,
      description: "Personalized suggestions just for you",
      href: "/recommendations",
      color: "text-purple-600"
    },
    {
      title: "Award Winners",
      icon: Award,
      description: "Discover critically acclaimed books",
      href: "/awards",
      color: "text-yellow-600"
    },
    {
      title: "Advanced Search",
      icon: Search,
      description: "Find books by genre, mood, or theme",
      href: "/search",
      color: "text-blue-600"
    }
  ];

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-headline">
              Discover
            </h2>
            <p className="text-muted-foreground mt-2">
              Find your next great read
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/discover">Explore More</Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Trending Books */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Trending This Week</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {trendingBooks.map((book, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <Image
                        src={book.cover}
                        alt={book.title}
                        width={60}
                        height={90}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{book.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                        {book.trending && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Discovery Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ways to Discover</h3>
            <div className="grid gap-4">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={feature.title} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`h-4 w-4 ${feature.color}`} />
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={feature.href}>Explore</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
