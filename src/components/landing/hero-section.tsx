import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10">
          <BookOpen className="h-16 w-16 text-primary/20" />
        </div>
        <div className="absolute top-32 right-20">
          <Users className="h-12 w-12 text-primary/20" />
        </div>
        <div className="absolute bottom-20 left-1/3">
          <TrendingUp className="h-14 w-14 text-primary/20" />
        </div>
      </div>
      
      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              YourBookList
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Track and discover books you love
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>2M+ Books</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>50K+ Readers</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Growing Daily</span>
            </div>
          </div>
          
          <div className="w-full max-w-md space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search for books, authors, or genres..." 
                className="pl-10 h-12"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="flex-1 sm:flex-none">
                <Link href="/search">Explore Books</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none">
                <Link href="/trending">See What's Trending</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
