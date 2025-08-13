import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Star, BookOpen } from 'lucide-react';
import Link from 'next/link';

export function CommunitySection() {
  const recentReviews = [
    {
      user: "Sarah M.",
      avatar: "https://placehold.co/40x40.png",
      book: "The Seven Husbands of Evelyn Hugo",
      rating: 5,
      snippet: "Absolutely captivating! Taylor Jenkins Reid has outdone herself...",
      timeAgo: "2 hours ago"
    },
    {
      user: "Mike R.",
      avatar: "https://placehold.co/40x40.png",
      book: "Klara and the Sun",
      rating: 4,
      snippet: "Ishiguro's prose is as beautiful as always. A thought-provoking read...",
      timeAgo: "5 hours ago"
    },
    {
      user: "Emma L.",
      avatar: "https://placehold.co/40x40.png",
      book: "Project Hail Mary",
      rating: 5,
      snippet: "Science fiction at its finest! Couldn't put it down...",
      timeAgo: "1 day ago"
    }
  ];

  const topLists = [
    {
      title: "Best Fantasy Books of 2025",
      creator: "BookLover_Jane",
      books: 25,
      likes: 142
    },
    {
      title: "Must-Read Mystery Novels",
      creator: "CrimeFiction_Fan",
      books: 18,
      likes: 98
    },
    {
      title: "Contemporary Fiction Gems",
      creator: "LitCritic_Sam",
      books: 22,
      likes: 76
    }
  ];

  const forumTopics = [
    {
      title: "What are you reading this month?",
      category: "General Discussion",
      replies: 47,
      lastActivity: "2 min ago"
    },
    {
      title: "Book Club: Discussing 'The Thursday Murder Club'",
      category: "Book Clubs",
      replies: 23,
      lastActivity: "1 hour ago"
    },
    {
      title: "Recommendations for sci-fi beginners?",
      category: "Recommendations",
      replies: 15,
      lastActivity: "3 hours ago"
    }
  ];

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-headline">
              Community
            </h2>
            <p className="text-muted-foreground mt-2">
              Connect with fellow book lovers
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/forums">Join Discussions</Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Reviews */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">Recent Reviews</h3>
            </div>
            <div className="space-y-4">
              {recentReviews.map((review, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback>{review.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium">{review.user}</p>
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{review.book}</p>
                        <p className="text-sm text-muted-foreground truncate">{review.snippet}</p>
                        <p className="text-xs text-muted-foreground mt-2">{review.timeAgo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/reviews">View All Reviews</Link>
            </Button>
          </div>

          {/* Top User Lists */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Popular Lists</h3>
            </div>
            <div className="space-y-4">
              {topLists.map((list, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">{list.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">by {list.creator}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{list.books} books</span>
                      <span>{list.likes} likes</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/lists">Browse All Lists</Link>
            </Button>
          </div>

          {/* Forum Activity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Forum Activity</h3>
            </div>
            <div className="space-y-4">
              {forumTopics.map((topic, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 text-sm">{topic.title}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">{topic.category}</Badge>
                      <span className="text-xs text-muted-foreground">{topic.replies} replies</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{topic.lastActivity}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/forums">View All Topics</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
