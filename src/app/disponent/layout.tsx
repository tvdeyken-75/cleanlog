

"use client";

import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { LayoutGrid, GanttChartSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const SETTINGS_STORAGE_KEY = 'fahrerchecklisteCompanySettings_v1';

export default function DisponentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, activeRole } = useAuth();
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || activeRole !== 'disponent')) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, activeRole, router]);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings.logo) {
          setLogo(parsedSettings.logo);
        }
      }
    } catch (error) {
      console.error("Could not access localStorage for settings", error);
    }
  }, []);

  if (isLoading || !isAuthenticated || activeRole !== 'disponent') {
     return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
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
                <Sidebar collapsible="icon">
                    <SidebarRail />
                    <SidebarContent>
                         {logo && (
                           <div className={cn(
                               "p-4 flex justify-center transition-all duration-200",
                               "group-data-[collapsible=icon]:p-2"
                           )}>
                             <Image src={logo} alt="Firmenlogo" width={128} height={64} 
                                className={cn(
                                    "transition-all duration-200",
                                    "group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10"
                                )}
                                style={{ objectFit: 'contain' }}
                              />
                           </div>
                        )}
                        <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/disponent" passHref>
                                <SidebarMenuButton 
                                    isActive={pathname === '/disponent'}
                                    tooltip={{
                                        children: "Dashboard",
                                        side: "right",
                                        align: "center",
                                    }}
                                >
                                    <LayoutGrid />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <Link href="/disponent/planung" passHref>
                                <SidebarMenuButton 
                                    isActive={pathname === '/disponent/planung'}
                                    tooltip={{
                                        children: "Planung",
                                        side: "right",
                                        align: "center",
                                    }}
                                >
                                    <GanttChartSquare />
                                    <span>Planung</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                <SidebarInset>
                    <div className="md:hidden p-4">
                        <SidebarTrigger />
                    </div>
                    {children}
                </SidebarInset>
            </div>
        </div>
    </SidebarProvider>
  );
}
