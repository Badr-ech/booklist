import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

export function LandingHeader() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
      <div className="flex items-center space-x-2">
        <Logo />
        <span className="font-bold text-xl font-headline">YourBookList</span>
      </div>
      
      <nav className="ml-auto flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" asChild className="text-sm font-medium">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild className="text-sm font-medium">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </nav>
    </header>
  );
}
