
"use client";

import { useAuth } from '@/context/AuthContext';
import { useProtocols } from '@/hooks/useProtocols';
import { useTour } from '@/context/TourContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProtocolsTable } from '@/components/dashboard/ProtocolsTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Archive, History } from 'lucide-react';
import type { Protocol } from '@/lib/types';
import { useMemo } from 'react';

interface GroupedProtocols {
  [transportOrder: string]: {
    protocols: Protocol[];
    truck_license_plate: string;
    trailer_license_plate: string;
  };
}

export default function ArchivePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { protocols, isLoading: protocolsLoading } = useProtocols(user);
  const { activeTour } = useTour();

  const archivedTours = useMemo(() => {
    const grouped = protocols.reduce((acc: GroupedProtocols, protocol) => {
      const order = protocol.transport_order;
      if (!order || order === activeTour?.transport_order) {
        return acc;
      }
      if (!acc[order]) {
        acc[order] = {
          protocols: [],
          truck_license_plate: protocol.truck_license_plate || 'N/A',
          trailer_license_plate: protocol.trailer_license_plate || 'N/A',
        };
      }
      acc[order].protocols.push(protocol);
      return acc;
    }, {});

    return Object.entries(grouped)
        .map(([transport_order, data]) => ({ transport_order, ...data }))
        .sort((a, b) => {
            const dateA = new Date(Math.max(...a.protocols.map(p => new Date(p.end_time).getTime()))).getTime();
            const dateB = new Date(Math.max(...b.protocols.map(p => new Date(p.end_time).getTime()))).getTime();
            return dateB - dateA;
        });

  }, [protocols, activeTour]);


  const isLoading = authLoading || protocolsLoading;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                    <Archive className="h-6 w-6 text-primary" />
                    Archivierte Touren
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : archivedTours.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {archivedTours.map(({ transport_order, protocols, truck_license_plate, trailer_license_plate }) => (
                            <AccordionItem value={transport_order} key={transport_order}>
                                <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 text-left">
                                      <div className='flex-1'>
                                        <p className="font-bold text-lg">{transport_order}</p>
                                        <p className="text-sm text-muted-foreground">{truck_license_plate}, {trailer_license_plate}</p>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{protocols.length} Protokolle</p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0">
                                    <ProtocolsTable protocols={protocols} isLoading={false} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-10">
                        <History className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Keine abgeschlossenen Touren</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Abgeschlossene Touren werden hier angezeigt, sobald Sie eine Tour beenden.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
