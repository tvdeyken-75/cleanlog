
"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Protocol, Photo, LoadingProtocol } from "@/lib/types";
import { getProtocolTitle } from "@/lib/utils";
import { File } from "lucide-react";

interface ProtocolDetailsDialogProps {
  protocol: Protocol;
  isOpen: boolean;
  onClose: () => void;
}

const keyToGerman: { [key: string]: string } = {
    location: 'Ort',
    start_time: 'Startzeit',
    end_time: 'Endzeit',
    truck_license_plate: 'LKW Kennzeichen',
    trailer_license_plate: 'Anhänger Kennzeichen',
    transport_order: 'Transportauftrag',
    cleaning_type: 'Reinigungsart',
    cleaning_products: 'Reinigungsmittel',
    control_type: 'Kontrollart',
    control_result: 'Kontrollergebnis',
    water_temperature: 'Wassertemperatur',
    water_quality: 'Wasserqualität',
    odometer_reading: 'Kilometerstand',
    liters: 'Liter',
    cargo_area_closed: 'Laderaum geschlossen',
    has_seal: 'Siegel vorhanden',
    cargo_area_temperature: 'Laderaumtemperatur',
    duration: 'Dauer (Minuten)',
    message: 'Nachricht',
    goods_type: 'Warenart',
    loading_protocol_number: 'Ladeprotokoll-Nr.',
    articles: 'Artikel',
    quantity: 'Menge',
    packaging: 'Verpackung',
    weight: 'Gewicht (kg)',
    pallets: 'Paletten',
    crates: 'Kisten',
    required_temperature_min: 'Min. Solltemperatur',
    required_temperature_max: 'Max. Solltemperatur',
    unloading_duration: 'Entlade-Dauer',
    emergency_type: 'Notfallart',
    description: 'Beschreibung',
    reference_number: 'Referenznummer',
    incident_type_description: 'Art des Vorfalls',
    help_called: 'Hilfe gerufen',
    estimated_duration: 'Geschätzte Dauer',
    vehicle_immobile: 'Fahrzeug fahruntüchtig',
    maintenance_type: 'Wartungsart',
    reason: 'Grund',
    amount: 'Betrag (€)',
    expense_type: 'Spesenart'
};

const booleanToGerman = (value: any) => {
    if (typeof value === 'boolean') {
        return value ? 'Ja' : 'Nein';
    }
    return value;
};


const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <p className="font-semibold text-sm capitalize">{label}</p>
            <p className="text-sm text-muted-foreground break-words">{String(value)}</p>
        </div>
    )
};


const PhotosSection = ({ photos, title = "Fotos" }: { photos?: Photo[], title?: string }) => {
    if (!photos || photos.length === 0) return null;
    return (
        <div>
            <h4 className="font-semibold text-md mb-2">{title}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                    <a key={index} href={photo.dataUrl} target="_blank" rel="noopener noreferrer" className="relative group">
                        {photo.mimeType.startsWith('image/') ? (
                             <Image src={photo.dataUrl} alt={`Dokument ${index + 1}`} width={200} height={150} className="rounded-md object-cover aspect-video"/>
                        ) : (
                            <div className="w-full aspect-video bg-muted rounded-md flex flex-col items-center justify-center p-2">
                                <File className="h-10 w-10 text-muted-foreground"/>
                                <p className="text-xs text-center text-muted-foreground mt-1 truncate">Dokument</p>
                            </div>
                        )}
                    </a>
                ))}
            </div>
        </div>
    )
}

export function ProtocolDetailsDialog({ protocol, isOpen, onClose }: ProtocolDetailsDialogProps) {
  if (!protocol) return null;

  const renderDetails = () => {
    const details = [];
    for(const [key, value] of Object.entries(protocol)) {
      // Skip complex objects, they will be handled separately
      if (typeof value === 'object' && value !== null) continue;
      if (key === 'id' || key === 'driverId' || key === 'type') continue;

      const label = keyToGerman[key] || key.replace(/_/g, ' ');
      let displayValue = value;
      if (key.endsWith('time')) {
        displayValue = new Date(value as string).toLocaleString('de-DE');
      } else {
        displayValue = booleanToGerman(value);
      }
      
      details.push(<DetailItem key={key} label={label} value={displayValue} />);
    }
    return details;
  }

  const photos = (protocol as any).photos || (protocol as any).documents;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{getProtocolTitle(protocol)}</DialogTitle>
          <DialogDescription>
            Details für Protokoll vom {new Date(protocol.end_time).toLocaleString('de-DE')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
            <div className="space-y-4">
                {renderDetails()}
                {'contamination_details' in protocol && protocol.contamination_details && (
                   <DetailItem label="Kontamination Details" value={<pre className="text-xs whitespace-pre-wrap">{JSON.stringify(protocol.contamination_details, null, 2)}</pre>} />
                )}
                <PhotosSection photos={photos} title="Dokumentation"/>
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
