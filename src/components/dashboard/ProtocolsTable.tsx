
"use client";

import { useState } from "react";
import type { Protocol, CleaningProtocol, FuelProtocol, PauseProtocol, LoadingProtocol, DeliveryProtocol, EmergencyProtocol, MaintenanceProtocol, ExpenseProtocol } from "@/lib/types";
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
import { Truck, AlertTriangle, CheckCircle2, Droplets, Fuel, Coffee, PackagePlus, PackageCheck, Siren, Camera, Wrench, Euro, Eye, Send } from "lucide-react";
import { Button } from "../ui/button";
import { ProtocolDetailsDialog } from "./ProtocolDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { formatProtocolForSharing } from "@/lib/utils";

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
        <div className="flex items-center justify-center gap-4">
            <Badge variant={protocol.control_result === 'n.i.O.' ? "destructive" : "secondary"} className="text-xs">
                {protocol.control_result === 'n.i.O.' ? 
                <AlertTriangle className="mr-1 h-3 w-3" /> : 
                <CheckCircle2 className="mr-1 h-3 w-3" />
                }
                {protocol.control_result}
            </Badge>
            {protocol.photos && protocol.photos.length > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    <span>{protocol.photos.length}</span>
                </div>
            )}
        </div>
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

const renderPauseDetails = (protocol: PauseProtocol) => (
    <>
      <TableCell>
        <div className="font-medium">{protocol.duration} Minuten</div>
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

const renderLoadingDetails = (protocol: LoadingProtocol) => (
  <>
    <TableCell>
      <div className="font-medium capitalize">{protocol.goods_type.replace('-', ' ')}</div>
      <div className="text-sm text-muted-foreground">{protocol.location}</div>
      <div className="text-xs text-muted-foreground mt-1 font-mono">{protocol.loading_protocol_number}</div>
    </TableCell>
    <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className={`h-4 w-4 ${protocol.cargo_area_closed ? 'text-green-500' : 'text-gray-300'}`} />
            <span>Laderaum</span>
            <CheckCircle2 className={`h-4 w-4 ${protocol.has_seal ? 'text-green-500' : 'text-gray-300'}`} />
            <span>Siegel</span>
        </div>
        {protocol.photos && protocol.photos.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Camera className="h-4 w-4" />
                <span>{protocol.photos.length}</span>
            </div>
        )}
      </TableCell>
  </>
);

const renderDeliveryDetails = (protocol: DeliveryProtocol) => (
    <>
      <TableCell>
        <div className="font-medium">Lieferung an</div>
        <div className="text-sm text-muted-foreground">{protocol.location}</div>
        <div className="text-xs text-muted-foreground mt-1 font-mono">Von: {protocol.loading_protocol_number}</div>
      </TableCell>
      <TableCell className="text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className={`h-4 w-4 ${protocol.cargo_area_closed ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Laderaum</span>
                <CheckCircle2 className={`h-4 w-4 ${protocol.has_seal ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Siegel</span>
            </div>
            {protocol.photos && protocol.photos.length > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    <span>{protocol.photos.length}</span>
                </div>
            )}
          </div>
        </TableCell>
    </>
  );

const renderEmergencyDetails = (protocol: EmergencyProtocol) => (
    <>
      <TableCell>
        <div className="font-medium capitalize">{protocol.emergency_type.replace('-', ' ')}</div>
        <div className="text-sm text-muted-foreground truncate max-w-xs">{protocol.description}</div>
      </TableCell>
      <TableCell className="text-center">
        {protocol.photos && protocol.photos.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Camera className="h-4 w-4" />
                <span>{protocol.photos.length}</span>
            </div>
        )}
      </TableCell>
    </>
);

const renderMaintenanceDetails = (protocol: MaintenanceProtocol) => (
    <>
      <TableCell>
        <div className="font-medium capitalize">{protocol.reason}</div>
        <div className="text-sm text-muted-foreground">{protocol.maintenance_type}</div>
      </TableCell>
      <TableCell className="text-center">
        {protocol.documents && protocol.documents.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Camera className="h-4 w-4" />
                <span>{protocol.documents.length}</span>
            </div>
        )}
      </TableCell>
    </>
);

const renderExpenseDetails = (protocol: ExpenseProtocol) => (
    <>
      <TableCell>
        <div className="font-medium capitalize">{protocol.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
        <div className="text-sm text-muted-foreground">{protocol.expense_type}</div>
      </TableCell>
      <TableCell className="text-center">
        {protocol.photos && protocol.photos.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Camera className="h-4 w-4" />
                <span>{protocol.photos.length}</span>
            </div>
        )}
      </TableCell>
    </>
);


const renderProtocolDetails = (protocol: Protocol) => {
    switch (protocol.type) {
        case 'cleaning':
            return renderCleaningDetails(protocol as CleaningProtocol);
        case 'fuel':
            return renderFuelDetails(protocol as FuelProtocol);
        case 'pause':
            return renderPauseDetails(protocol as PauseProtocol);
        case 'loading':
            return renderLoadingDetails(protocol as LoadingProtocol);
        case 'delivery':
            return renderDeliveryDetails(protocol as DeliveryProtocol);
        case 'emergency':
            return renderEmergencyDetails(protocol as EmergencyProtocol);
        case 'maintenance':
            return renderMaintenanceDetails(protocol as MaintenanceProtocol);
        case 'expense':
            return renderExpenseDetails(protocol as ExpenseProtocol);
        default:
            return <><TableCell></TableCell><TableCell></TableCell></>;
    }
}


export function ProtocolsTable({ protocols, isLoading }: ProtocolsTableProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const { toast } = useToast();

  const handleSend = async (protocol: Protocol) => {
    if (!navigator.share) {
      toast({
        variant: "destructive",
        title: "Nicht unterstützt",
        description: "Ihr Browser unterstützt die Web Share API nicht. Bitte verwenden Sie eine andere Methode, um die Daten zu senden.",
      });
      return;
    }

    try {
      const { title, text, files } = formatProtocolForSharing(protocol);

      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({ title, text, files });
      } else {
        await navigator.share({ title, text });
      }

      toast({
        title: "Protokoll geteilt",
        description: "Das Protokoll wurde zum Teilen vorbereitet.",
      });
    } catch (error) {
      // Ignore abort errors from the user cancelling the share
      if ((error as DOMException).name !== 'AbortError') {
        console.error("Fehler beim Teilen:", error);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Das Protokoll konnte nicht geteilt werden.",
        });
      }
    }
  };


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
        case 'pause':
            return <Coffee className="h-5 w-5 text-purple-500" />;
        case 'loading':
            return <PackagePlus className="h-5 w-5 text-green-500" />;
        case 'delivery':
            return <PackageCheck className="h-5 w-5 text-indigo-500" />;
        case 'emergency':
            return <Siren className="h-5 w-5 text-red-500" />;
        case 'maintenance':
            return <Wrench className="h-5 w-5 text-gray-500" />;
        case 'expense':
            return <Euro className="h-5 w-5 text-yellow-600" />;
        default:
            return <Truck className="h-5 w-5 text-gray-400" />;
    }
  }

  const sortedProtocols = [...protocols].sort((a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime());

  return (
    <>
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Fahrzeug</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-center">Status/Ergebnis</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProtocols.map((protocol) => (
            <TableRow key={protocol.id}>
              <TableCell className="w-12 text-center">
                  {getProtocolTypeIcon(protocol.type)}
              </TableCell>
              <TableCell>
                <div className="font-medium">{protocol.truck_license_plate}</div>
                <div className="text-sm text-muted-foreground">{protocol.trailer_license_plate}</div>
              </TableCell>
              {renderProtocolDetails(protocol)}
              <TableCell className="text-right">
                {new Date(protocol.end_time).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </TableCell>
               <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedProtocol(protocol)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Details ansehen</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleSend(protocol)}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Senden</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    {selectedProtocol && (
        <ProtocolDetailsDialog 
            protocol={selectedProtocol}
            isOpen={!!selectedProtocol}
            onClose={() => setSelectedProtocol(null)}
        />
    )}
    </>
  );
}
