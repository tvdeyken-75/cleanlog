
"use client";

import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { LayoutGrid, GanttChartSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DisponentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, activeRole } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || activeRole !== 'disponent')) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, activeRole, router]);

  if (isLoading || !isAuthenticated || activeRole !== 'disponent') {
     return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="w-full h-96" />
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar>
                    <SidebarContent>
                        <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/disponent" passHref>
                                <SidebarMenuButton isActive={pathname === '/disponent'}>
                                    <LayoutGrid />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <Link href="/disponent/planung" passHref>
                                <SidebarMenuButton isActive={pathname === '/disponent/planung'}>
                                    <GanttChartSquare />
                                    <span>Planung</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                <SidebarInset>
                    <main className="flex-1 p-4 md:p-8">
                         <div className="md:hidden mb-4">
                            <SidebarTrigger />
                        </div>
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </div>
    </SidebarProvider>
  );
}
