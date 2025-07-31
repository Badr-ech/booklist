import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

export function LandingHeader() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <Logo />
      <nav className="ml-auto flex gap-2 sm:gap-4">
        <Button variant="ghost" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </nav>
    </header>
  );
}
