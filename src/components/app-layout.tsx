'use client';

import {
  BookOpen,
  LayoutDashboard,
  Lightbulb,
  MessageCircle,
  Search,
  Target,
  User,
  Users,
  Activity,
  TrendingUp,
  Trophy,
  Award,
  Heart,
  BarChart3,
  Quote,
  Zap,
  Crown,
  BookMarked,
  ChevronDown,
  PieChart,
  Newspaper,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { UserNav } from './user-nav';
import { ThemeBackground } from './theme-background';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const primaryItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/discover', label: 'Discover', icon: Users },
    { href: '/recommendations', label: 'Recommendations', icon: Lightbulb },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const discoverItems = [
    { href: '/awards', label: 'Award Winners', icon: Award },
    { href: '/staff-picks', label: 'Staff Picks', icon: Crown },
    { href: '/browse-mood', label: 'Browse by Mood', icon: Heart },
    { href: '/series', label: 'Book Series', icon: BookMarked },
    { href: '/quotes', label: 'Book Quotes', icon: Quote },
  ];

  const trackingItems = [
    { href: '/progress', label: 'Reading Progress', icon: BarChart3 },
    { href: '/streaks', label: 'Reading Streaks', icon: Zap },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/stats', label: 'Global Statistics', icon: PieChart },
    { href: '/activity', label: 'Activity Feed', icon: Activity },
  ];

  const communityItems = [
    { href: '/forums', label: 'Forums', icon: MessageCircle },
    { href: '/book-clubs', label: 'Book Clubs', icon: BookOpen },
    { href: '/challenges', label: 'Challenges', icon: Target },
    { href: '/leaderboards', label: 'Leaderboards', icon: Trophy },
    { href: '/news', label: 'News', icon: Newspaper },
  ];

  const NavItem = ({ item, className = "" }: { item: any, className?: string }) => (
    <Link
      href={item.href}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        pathname === item.href
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      } ${className}`}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );

  const DropdownGroup = ({ 
    items, 
    label, 
    icon: Icon 
  }: { 
    items: any[], 
    label: string, 
    icon: any 
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium ${
            items.some(item => pathname === item.href)
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} className="flex items-center space-x-2">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <ThemeBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header with Logo and User Nav */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-6">
              <Logo />
              
              {/* Primary Navigation - Always visible */}
              <nav className="hidden lg:flex items-center space-x-1">
                {primaryItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </nav>
            </div>
            
            <UserNav />
          </div>
        </header>

        {/* Secondary Navigation - Grouped dropdowns */}
        <nav className="border-b bg-background/50">
          <div className="container">
            <div className="flex items-center space-x-1 py-2 overflow-x-auto">
              <DropdownGroup 
                items={discoverItems} 
                label="Discover" 
                icon={Heart} 
              />
              <DropdownGroup 
                items={trackingItems} 
                label="Tracking" 
                icon={BarChart3} 
              />
              <DropdownGroup 
                items={communityItems} 
                label="Community" 
                icon={Users} 
              />
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <nav className="lg:hidden border-b bg-background/50">
          <div className="container">
            <div className="flex items-center space-x-1 py-2 overflow-x-auto">
              {primaryItems.map((item) => (
                <NavItem key={item.href} item={item} className="whitespace-nowrap" />
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 container py-6">
          {children}
        </main>
      </div>
    </ThemeBackground>
  );
}
