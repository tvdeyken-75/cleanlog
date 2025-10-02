
"use client";

import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LayoutDashboard, Menu, Truck } from "lucide-react";
import Link from 'next/link';

export default function DisponentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="w-full h-96" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menü öffnen</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Menü</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Link href="/disponent" passHref>
                    <Button variant="ghost" className="w-full justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>
                <Link href="/disponent/planung" passHref>
                     <Button variant="ghost" className="w-full justify-start">
                        <Truck className="mr-2 h-4 w-4" />
                        Tourplanung
                    </Button>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="p-4 md:p-6 md:pl-20">
          {children}
        </div>
      </main>
    </div>
  );
}
