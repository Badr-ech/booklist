import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Heart, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function YourListsSection() {
  const lists = [
    {
      title: "Currently Reading",
      icon: BookOpen,
      count: "12 books",
      description: "Books you're reading right now",
      href: "/dashboard?filter=reading",
      color: "text-blue-600"
    },
    {
      title: "Want to Read",
      icon: Heart,
      count: "47 books",
      description: "Your wishlist of future reads",
      href: "/dashboard?filter=wishlist",
      color: "text-red-600"
    },
    {
      title: "Completed",
      icon: CheckCircle,
      count: "134 books",
      description: "Books you've finished",
      href: "/dashboard?filter=completed",
      color: "text-green-600"
    },
    {
      title: "On Hold",
      icon: Clock,
      count: "3 books",
      description: "Books you've paused",
      href: "/dashboard?filter=on-hold",
      color: "text-yellow-600"
    }
  ];

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-headline">
              Your Lists
            </h2>
            <p className="text-muted-foreground mt-2">
              Organize and track your reading journey
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">View All Lists</Link>
          </Button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lists.map((list) => {
            const IconComponent = list.icon;
            return (
              <Card key={list.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-5 w-5 ${list.color}`} />
                    <CardTitle className="text-lg">{list.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{list.count}</p>
                    <p className="text-sm text-muted-foreground">{list.description}</p>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link href={list.href}>View List</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
