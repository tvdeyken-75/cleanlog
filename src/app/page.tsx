

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTour } from '@/context/TourContext';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, activeRole } = useAuth();
  const { activeTour, isLoading: tourLoading, isMaintenanceMode } = useTour();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    } else if (!authLoading && isAuthenticated) {
        if (activeRole === 'driver' && !tourLoading && !activeTour && !isMaintenanceMode) {
          router.replace('/tour-selection');
        } else if (activeRole === 'disponent') {
          router.replace('/disponent');
        }
    }
  }, [authLoading, isAuthenticated, activeRole, tourLoading, activeTour, isMaintenanceMode, router]);

  const isLoading = authLoading || (activeRole === 'driver' && (tourLoading || (!activeTour && !isMaintenanceMode)));

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>
            <Skeleton className="w-full h-96" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <DashboardClient />
      </main>
    </div>
  );
}
