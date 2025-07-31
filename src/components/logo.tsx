import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  textClassName?: string;
};

export function Logo({ className, textClassName }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2 group', className)}
      aria-label="YourBookList homepage"
    >
      <BookOpen className="h-6 w-6 text-primary group-hover:text-primary/90 transition-colors" />
      <span
        className={cn(
          'text-xl font-bold text-foreground group-hover:text-foreground/90 transition-colors',
          textClassName
        )}
      >
        YourBookList
      </span>
    </Link>
  );
}
