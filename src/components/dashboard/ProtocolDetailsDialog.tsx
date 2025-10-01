
"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Protocol, Photo } from "@/lib/types";
import { getProtocolTitle } from "@/lib/utils";
import { File } from "lucide-react";

interface ProtocolDetailsDialogProps {
  protocol: Protocol;
  isOpen: boolean;
  onClose: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <p className="font-semibold text-sm">{label}</p>
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

      details.push(<DetailItem key={key} label={key.replace(/_/g, ' ')} value={String(value)} />);
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
