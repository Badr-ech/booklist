'use client';

import {
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Newspaper,
  Search,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar';
import { UserNav } from './user-nav';
import { ThemeBackground } from './theme-background';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/recommendations', label: 'Recommendations', icon: Lightbulb },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <ThemeBackground>
      <SidebarProvider>
        <Sidebar className="sidebar">
          <SidebarHeader>
            <Logo textClassName="text-sidebar-foreground" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 hidden md:flex">
                <SidebarTrigger />
              </div>
              <div className="flex items-center space-x-4 md:hidden">
                <SidebarTrigger />
                <Logo />
              </div>
              <div className="flex flex-1 items-center justify-end space-x-4">
                <UserNav />
              </div>
            </div>
          </header>
          <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeBackground>
  );
}
