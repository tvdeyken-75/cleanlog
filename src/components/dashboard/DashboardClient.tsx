"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Droplets, Fuel, Coffee } from 'lucide-react';
import { ProtocolsTable } from './ProtocolsTable';
import { useProtocols } from '@/hooks/useProtocols';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import { useTour } from '@/context/TourContext';

export function DashboardClient() {
  const { user } = useAuth();
  const { protocols, isLoading: protocolsLoading } = useProtocols(user);
  const { activeTour } = useTour();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-semibold md:text-3xl">Meine Protokolle</h1>
          {activeTour && <p className="text-muted-foreground">Aktuelle Tour: {activeTour.transport_order}</p>}
        </div>
        <div className="flex gap-2">
          <Link href="/protocols/pause" passHref>
            <Button variant="outline">
              <Coffee className="mr-2 h-4 w-4" />
              Pause
            </Button>
          </Link>
          <Link href="/protocols/fuel" passHref>
            <Button variant="outline">
              <Fuel className="mr-2 h-4 w-4" />
              Tanken
            </Button>
          </Link>
          <Link href="/protocols/new" passHref>
            <Button variant="outline">
              <Droplets className="mr-2 h-4 w-4" />
              Reinigung
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
