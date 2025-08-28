"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Fuel } from 'lucide-react';
import { ProtocolsTable } from './ProtocolsTable';
import { useProtocols } from '@/hooks/useProtocols';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function DashboardClient() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { protocols, isLoading: protocolsLoading } = useProtocols(user);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-headline text-2xl font-semibold md:text-3xl">Meine Protokolle</h1>
        <div className="flex gap-2">
          <Link href="/protocols/fuel" passHref>
            <Button variant="outline">
              <Fuel className="mr-2 h-4 w-4" />
              Tanken
            </Button>
          </Link>
          <Link href="/protocols/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Neues Protokoll
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <ProtocolsTable protocols={protocols} isLoading={protocolsLoading} />
        </CardContent>
      </Card>
    </>
  );
}
