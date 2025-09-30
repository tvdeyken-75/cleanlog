
"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Droplets, Fuel, Coffee, PackagePlus, PackageCheck, Siren, Archive, Euro } from 'lucide-react';
import { ProtocolsTable } from './ProtocolsTable';
import { useProtocols } from '@/hooks/useProtocols';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import { useTour } from '@/context/TourContext';

export function DashboardClient() {
  const { user } = useAuth();
  const { protocols, isLoading: protocolsLoading } = useProtocols(user);
  const { activeTour, isMaintenanceMode } = useTour();

  const activeTourProtocols = protocols.filter(p => {
    if (isMaintenanceMode) {
      // In maintenance mode, show protocols with no transport order
      return !p.transport_order;
    }
    // In tour mode, show protocols for the active tour
    return p.transport_order === activeTour?.transport_order;
  });

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-semibold md:text-3xl">Meine Protokolle</h1>
          {activeTour && !isMaintenanceMode && <p className="text-muted-foreground">Aktuelle Tour: {activeTour.transport_order}</p>}
          {isMaintenanceMode && <p className="text-muted-foreground">Wartungsmodus für: {activeTour?.truck_license_plate}{activeTour?.truck_license_plate && activeTour?.trailer_license_plate && ', '}{activeTour?.trailer_license_plate}</p>}
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                <Link href="/protocols/new" passHref className="flex-1">
                    <Button variant="outline" size="lg" className="w-full">
                    <Droplets className="mr-2 h-5 w-5" />
                    Reinigung
                    </Button>
                </Link>
                <Link href="/protocols/laden" passHref className="flex-1">
                    <Button variant="outline" size="lg" className="w-full">
                    <PackagePlus className="mr-2 h-5 w-5" />
                    Laden
                    </Button>
                </Link>
                <Link href="/protocols/delivery" passHref className="flex-1">
                    <Button variant="outline" size="lg" className="w-full">
                    <PackageCheck className="mr-2 h-5 w-5" />
                    Liefern
                    </Button>
                </Link>
                 <Link href="/protocols/fuel" passHref className="flex-1">
                    <Button variant="outline" size="lg" className="w-full">
                    <Fuel className="mr-2 h-5 w-5" />
                    Tanken
                    </Button>
                </Link>
            </div>
            <div className="flex flex-wrap gap-2">
                 <Link href="/protocols/pause" passHref className="flex-1">
                    <Button variant="outline" size="lg" className="w-full">
                    <Coffee className="mr-2 h-5 w-5" />
                    Pause
                    </Button>
                </Link>
                 <Link href="/protocols/expense" passHref className="flex-1">
                    <Button variant="outline" size="lg" className="w-full">
                    <Euro className="mr-2 h-5 w-5" />
                    Spesen
                    </Button>
                </Link>
                <Link href="/archive" passHref className="flex-1">
                    <Button size="lg" className="w-full">
                    <Archive className="mr-2 h-5 w-5" />
                    Archiv
                    </Button>
                </Link>
                <Link href="/protocols/emergency" passHref className="flex-1">
                    <Button variant="destructive" size="lg" className="w-full">
                    <Siren className="mr-2 h-5 w-5" />
                    Notfall
                    </Button>
                </Link>
            </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <ProtocolsTable protocols={activeTourProtocols} isLoading={protocolsLoading} />
        </CardContent>
      </Card>
    </>
  );
}
