import { LandingHeader } from '@/components/landing-header';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, BotMessageSquare, Search, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Organize Your Reading Life
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    YourBookList is the ultimate tool for book lovers. Track
                    your reading, discover new books with AI, and connect with a
                    community of readers.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started for Free</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="reading books"
                className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Everything You Need to Be a Super-Reader
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From tracking your progress to finding your next favorite book,
                  we&apos;ve got you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-1 text-center p-4 rounded-lg">
                <BookOpenCheck className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Track Your Books</h3>
                <p className="text-sm text-muted-foreground">
                  Easily manage your reading lists: currently reading, read, and
                  wishlist. Never lose track of a book again.
                </p>
              </div>
              <div className="grid gap-1 text-center p-4 rounded-lg">
                <BotMessageSquare className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized book suggestions from our AI based on your unique
                  reading history and preferences.
                </p>
              </div>
              <div className="grid gap-1 text-center p-4 rounded-lg">
                <Search className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Discover & Search</h3>
                <p className="text-sm text-muted-foreground">
                  Search our extensive database to find books and authors.
                  Discover new reads and add them to your lists.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} YourBookList. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
