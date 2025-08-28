"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Droplets, Fuel, Coffee, PackagePlus, PackageCheck, Siren } from 'lucide-react';
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
        <div className="flex flex-wrap gap-2">
          <Link href="/protocols/new" passHref>
            <Button variant="outline" size="lg">
              <Droplets className="mr-2 h-5 w-5" />
              Reinigung
            </Button>
          </Link>
          <Link href="/protocols/laden" passHref>
            <Button variant="outline" size="lg">
              <PackagePlus className="mr-2 h-5 w-5" />
              Laden
            </Button>
          </Link>
          <Link href="/protocols/delivery" passHref>
            <Button variant="outline" size="lg">
              <PackageCheck className="mr-2 h-5 w-5" />
              Liefern
            </Button>
          </Link>
          <Link href="/protocols/pause" passHref>
            <Button variant="outline" size="lg">
              <Coffee className="mr-2 h-5 w-5" />
              Pause
            </Button>
          </Link>
          <Link href="/protocols/fuel" passHref>
            <Button variant="outline" size="lg">
              <Fuel className="mr-2 h-5 w-5" />
              Tanken
            </Button>
          </Link>
          <Link href="/protocols/emergency" passHref>
            <Button variant="destructive" size="lg">
              <Siren className="mr-2 h-5 w-5" />
              Notfall
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
