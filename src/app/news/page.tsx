'use client';

import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockNewsFeed, mockUpcomingReleases } from '@/lib/mock-data';
import { BookmarkPlus, Rss } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { addBookToWishlist } from '../actions';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { Book } from '@/lib/types';

export default function NewsPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleAddToWishlist = async (book: Omit<Book, 'status'>) => {
        if (!user) {
            toast({
                title: 'Please log in',
                description: 'You need to be logged in to add books to your wishlist.',
                variant: 'destructive',
            });
            return;
        }
        
        const result = await addBookToWishlist({ userId: user.uid, book });

        if (result.success) {
            toast({
                title: 'Added to Wishlist!',
                description: `"${book.title}" has been added to your wishlist.`,
            });
        } else {
             toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            });
        }
    };


  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">News & Upcoming Releases</h2>
          <p className="text-muted-foreground">
            Stay up-to-date with the latest in the literary world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* News Feed Section */}
            <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Rss className="h-6 w-6" />
                            Book News Feed
                        </CardTitle>
                        <CardDescription>The latest headlines from the world of books.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockNewsFeed.map((item) => (
                        <div key={item.id} className="p-4 rounded-lg border">
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-muted-foreground text-sm mt-1">{item.summary}</p>
                            <Button variant="link" asChild className="p-0 h-auto mt-2">
                                <Link href={item.link}>Read More</Link>
                            </Button>
                        </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Releases Section */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                            Upcoming Releases
                        </CardTitle>
                        <CardDescription>Get excited for these future bestsellers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {mockUpcomingReleases.map((book) => (
                           <div key={book.id} className="flex items-start gap-4">
                               <Image 
                                 src={book.coverImage}
                                 alt={`Cover of ${book.title}`}
                                 width={80}
                                 height={120}
                                 className="rounded-md aspect-[2/3] object-cover"
                                 data-ai-hint="book cover"
                               />
                               <div className="flex-1">
                                    <h4 className="font-semibold">{book.title}</h4>
                                    <p className="text-sm text-muted-foreground">{book.author}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{book.releaseDate}</p>
                                    <Button size="sm" className="mt-2" onClick={() => handleAddToWishlist({
                                        id: book.id,
                                        title: book.title,
                                        author: book.author,
                                        coverImage: book.coverImage,
                                        genre: book.genre,
                                    })}>
                                        <BookmarkPlus className="h-4 w-4 mr-2" />
                                        Want to Read
                                    </Button>
                               </div>
                           </div>
                       ))}
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>
    </AppLayout>
  );
}
