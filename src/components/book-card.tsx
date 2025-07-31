import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Book } from '@/lib/types';
import { Star } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

interface BookCardProps extends React.HTMLAttributes<HTMLDivElement> {
  book: Book;
  aspectRatio?: 'portrait' | 'square';
  width?: number;
  height?: number;
}

export function BookCard({ book, aspectRatio = 'portrait', width = 150, height = 225, className, ...props }: BookCardProps) {
  const { theme } = useTheme();
  
  return (
    <div className={cn('space-y-3 book-card flex flex-col h-full max-w-[150px]', className)} {...props}>
      <div className="overflow-hidden rounded-md relative group flex-shrink-0">
        <Image
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          data-ai-hint="book cover"
          width={width}
          height={height}
          className={cn(
            'w-full h-auto object-cover transition-all duration-300 hover:scale-105',
            aspectRatio === 'portrait' ? 'aspect-[2/3]' : 'aspect-square'
          )}
        />
        {/* Theme-specific overlay effects */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          theme === 'fantasy' && "bg-gradient-to-t from-purple-900/50 to-transparent",
          theme === 'scifi' && "bg-gradient-to-t from-cyan-900/50 to-transparent",
          theme === 'horror' && "bg-gradient-to-t from-red-900/50 to-transparent",
          theme === 'romance' && "bg-gradient-to-t from-pink-200/30 to-transparent",
          theme === 'thriller' && "bg-gradient-to-t from-blue-900/50 to-transparent",
          theme === 'historical' && "bg-gradient-to-t from-yellow-800/30 to-transparent"
        )} />
      </div>
      <div className="space-y-2 text-sm px-1 flex-1 flex flex-col justify-start">
        <h3 className={cn(
          "font-medium leading-tight text-sm h-12 flex items-start overflow-hidden",
          theme === 'fantasy' && "text-purple-200 font-cinzel text-xs",
          theme === 'scifi' && "text-cyan-300 font-orbitron tracking-wider text-xs",
          theme === 'horror' && "text-red-200 font-creepster text-xs",
          theme === 'romance' && "text-rose-700 font-dancing italic text-sm",
          theme === 'thriller' && "text-blue-200 font-source-code text-xs",
          theme === 'historical' && "text-amber-800 font-playfair text-xs"
        )}>
          <span className="break-words line-clamp-3 leading-tight">
            {book.title}
          </span>
        </h3>
        <p className={cn(
          "text-xs text-muted-foreground leading-tight line-clamp-1",
          theme === 'fantasy' && "text-purple-300 text-xs",
          theme === 'scifi' && "text-cyan-400 text-xs",
          theme === 'horror' && "text-red-300 text-xs",
          theme === 'romance' && "text-rose-600 text-xs",
          theme === 'thriller' && "text-blue-300 text-xs",
          theme === 'historical' && "text-amber-700 text-xs"
        )}>
          {book.author}
        </p>
        {book.rating && (
          <div className="flex items-center space-x-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4 transition-colors',
                    i < book.rating! ? (
                      theme === 'fantasy' ? 'text-purple-400 fill-purple-400' :
                      theme === 'scifi' ? 'text-cyan-400 fill-cyan-400' :
                      theme === 'horror' ? 'text-red-400 fill-red-400' :
                      theme === 'romance' ? 'text-pink-400 fill-pink-400' :
                      theme === 'thriller' ? 'text-blue-400 fill-blue-400' :
                      theme === 'historical' ? 'text-amber-400 fill-amber-400' :
                      'text-amber-400 fill-amber-400'
                    ) : 'text-muted-foreground'
                  )}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
