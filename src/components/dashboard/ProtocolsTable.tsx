"use client";

import type { Protocol, CleaningProtocol, FuelProtocol } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, AlertTriangle, CheckCircle2, Droplets, Fuel } from "lucide-react";

interface ProtocolsTableProps {
  protocols: Protocol[];
  isLoading: boolean;
}

const renderCleaningDetails = (protocol: CleaningProtocol) => (
  <>
    <TableCell>
      <div className="font-medium">{protocol.cleaning_type}</div>
      <div className="text-sm text-muted-foreground">{protocol.location}</div>
    </TableCell>
    <TableCell className="text-center">
      <Badge variant={protocol.control_result === 'n.i.O.' ? "destructive" : "secondary"} className="text-xs">
        {protocol.control_result === 'n.i.O.' ? 
          <AlertTriangle className="mr-1 h-3 w-3" /> : 
          <CheckCircle2 className="mr-1 h-3 w-3" />
        }
        {protocol.control_result}
      </Badge>
    </TableCell>
  </>
);

const renderFuelDetails = (protocol: FuelProtocol) => (
    <>
      <TableCell>
        <div className="font-medium">{protocol.liters} Liter</div>
        <div className="text-sm text-muted-foreground">{protocol.location}</div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className={`h-4 w-4 ${protocol.cargo_area_closed ? 'text-green-500' : 'text-gray-300'}`} />
            <span>Laderaum</span>
            <CheckCircle2 className={`h-4 w-4 ${protocol.has_seal ? 'text-green-500' : 'text-gray-300'}`} />
            <span>Siegel</span>
        </div>
      </TableCell>
    </>
  );

export function ProtocolsTable({ protocols, isLoading }: ProtocolsTableProps) {
  if (isLoading) {
    return (
      <div className="p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-4 border-b">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (protocols.length === 0) {
    return (
      <div className="text-center p-10">
        <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Keine Protokolle gefunden</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Erstellen Sie Ihr erstes Protokoll, um es hier zu sehen.
        </p>
      </div>
    );
  }
  
  const getProtocolTypeIcon = (type: string) => {
    switch (type) {
        case 'cleaning':
            return <Droplets className="h-5 w-5 text-blue-500" />;
        case 'fuel':
            return <Fuel className="h-5 w-5 text-orange-500" />;
        default:
            return <Truck className="h-5 w-5 text-gray-400" />;
    }
  }


  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Fahrzeug</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-center">Status/Ergebnis</TableHead>
            <TableHead className="text-right">Datum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {protocols.map((protocol) => (
            <TableRow key={protocol.id}>
              <TableCell className="w-12 text-center">
                  {getProtocolTypeIcon(protocol.type)}
              </TableCell>
              <TableCell>
                <div className="font-medium">{protocol.truck_license_plate}</div>
                <div className="text-sm text-muted-foreground">{protocol.trailer_license_plate}</div>
              </TableCell>
              {protocol.type === 'cleaning' ? renderCleaningDetails(protocol as CleaningProtocol) : renderFuelDetails(protocol as FuelProtocol)}
              <TableCell className="text-right">
                {new Date(protocol.end_time).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
