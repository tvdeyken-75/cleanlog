
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { DisponentDashboard } from '@/components/disponent/DisponentDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DisponentPage() {
  const router = useRouter();
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
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <DisponentDashboard />
      </main>
    </div>
  );
}
