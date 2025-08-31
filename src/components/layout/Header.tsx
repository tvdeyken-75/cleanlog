
"use client";

import { useAuth } from '@/context/AuthContext';
import { useTour } from '@/context/TourContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Truck, LogOut, Map, UserCog, Printer, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useProtocols } from '@/hooks/useProtocols';
import { CleaningProtocol, DeliveryProtocol, EmergencyProtocol, FuelProtocol, LoadingProtocol, MaintenanceProtocol, PauseProtocol, Protocol } from '@/lib/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const LOGO_STORAGE_KEY = 'fahrerLogbuchLogo_v1';

export function Header() {
  const { user, logout, isAuthenticated, userRole } = useAuth();
  const { activeTour } = useTour();
  const router = useRouter();
  const { protocols } = useProtocols(user);
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleEndTour = () => {
    router.push('/tour-summary');
  }
  
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  const handlePrint = async () => {
    if (!activeTour) return;
    setIsPrinting(true);
    toast({ title: "PDF wird generiert...", description: "Dies kann einen Moment dauern."});

    const tourProtocols = protocols
        .filter(p => p.transport_order === activeTour.transport_order)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    try {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const usableWidth = pageWidth - 2 * margin;
        let yPos = margin;

        // 1. Add Logo
        try {
            const logoDataUrl = localStorage.getItem(LOGO_STORAGE_KEY);
            if (logoDataUrl) {
                const img = new Image();
                img.src = logoDataUrl;
                await new Promise(resolve => img.onload = resolve);
                const aspectRatio = img.width / img.height;
                const logoWidth = 30;
                const logoHeight = logoWidth / aspectRatio;
                doc.addImage(logoDataUrl, 'PNG', pageWidth - margin - logoWidth, margin, logoWidth, logoHeight);
            }
        } catch (e) {
            console.error("Could not load or add logo", e);
        }

        // 2. Add Title
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text("Tour-Zusammenfassung", margin, yPos + 5);
        yPos += 15;

        // 3. Add Tour Info
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        autoTable(doc, {
            body: [
                ['Transportauftrag:', activeTour.transport_order],
                ['Fahrer:', user || 'N/A'],
                ['LKW:', activeTour.truck_license_plate],
                ['Anhänger:', activeTour.trailer_license_plate],
                ['Datum:', new Date().toLocaleDateString('de-DE')],
            ],
            startY: yPos,
            theme: 'plain',
            styles: { fontSize: 12 },
            columnStyles: { 0: { fontStyle: 'bold' } }
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        

        // 4. Add Protocols
        for (const protocol of tourProtocols) {
            if (yPos > pageHeight - 40) { // check for new page before adding a protocol
                doc.addPage();
                yPos = margin;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(getProtocolTitle(protocol), margin, yPos);
            yPos += 6;
            
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.text(`${new Date(protocol.start_time).toLocaleString('de-DE')} an ${protocol.location || 'N/A'}`, margin, yPos);
            yPos += 8;

            const { body, head } = getProtocolDetailsForPdf(protocol);

            autoTable(doc, {
                head: head,
                body: body,
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [230, 230, 230], textColor: 20, fontStyle: 'bold' },
                styles: { fontSize: 10 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
                didDrawPage: (data) => {
                    yPos = data.cursor?.y || margin;
                }
            });
            yPos = (doc as any).lastAutoTable.finalY + 5;

            // Add photos
            const photos = (protocol as any).photos || (protocol as any).documents;
            if (photos && photos.length > 0) {
                 if (yPos > pageHeight - 45) { // check for new page before adding photos
                    doc.addPage();
                    yPos = margin;
                }
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text("Dokumentation:", margin, yPos);
                yPos += 5;

                const photoSize = 60; // size of photo in mm
                let xPos = margin;

                for (const photo of photos) {
                     if (xPos + photoSize > pageWidth - margin) {
                        xPos = margin;
                        yPos += photoSize + 5;
                    }
                    if (yPos + photoSize > pageHeight - margin) {
                        doc.addPage();
                        yPos = margin;
                        xPos = margin;
                    }
                    if (photo.mimeType.startsWith('image/')) {
                      doc.addImage(photo.dataUrl, photo.mimeType.replace('image/', '').toUpperCase(), xPos, yPos, photoSize, photoSize);
                    } else {
                       doc.text("PDF-Dokument", xPos, yPos + 10);
                    }
                    xPos += photoSize + 5;
                }
                yPos += photoSize + 10;
            }
             yPos += 5;
        }

        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], `tour-summary-${activeTour.transport_order}.pdf`, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
                title: 'Tour-Zusammenfassung',
                text: `Protokolle für Tour ${activeTour.transport_order}`,
                files: [pdfFile],
            });
        } else {
            doc.save(`tour-summary-${activeTour.transport_order}.pdf`);
            toast({
                title: "PDF wird heruntergeladen",
                description: "Dein Browser unterstützt das direkte Teilen nicht. Die PDF-Datei wird stattdessen heruntergeladen.",
            });
        }
    } catch (error) {
        console.error("Fehler beim Erstellen oder Teilen des PDFs", error);
        toast({
            variant: "destructive",
            title: "Fehler",
            description: "Das PDF konnte nicht erstellt oder geteilt werden."
        });
    } finally {
        setIsPrinting(false);
    }
  };

  const getProtocolTitle = (protocol: Protocol) => {
    switch (protocol.type) {
        case 'cleaning': return 'Reinigungsprotokoll';
        case 'fuel': return 'Tankprotokoll';
        case 'pause': return 'Pausenprotokoll';
        case 'loading': return 'Ladeprotokoll';
        case 'delivery': return 'Lieferprotokoll';
        case 'emergency': return 'Notfallprotokoll';
        case 'maintenance': return 'Wartungsprotokoll';
        default: return 'Protokoll';
    }
  }
  
  const getProtocolDetailsForPdf = (protocol: Protocol) => {
     let body: (string | number)[][] = [];
     const head = [['Feld', 'Wert']];
     switch (protocol.type) {
        case 'cleaning':
            body = [
                ['Reinigungstyp', protocol.cleaning_type],
                ['Reinigungsmittel', protocol.cleaning_products],
                ['Kontrolltyp', protocol.control_type],
                ['Ergebnis', protocol.control_result],
                ['Wassertemperatur', `${protocol.water_temperature}°C`],
                ['Wasserqualität', protocol.water_quality],
            ];
            if (protocol.control_result === 'n.i.O.' && protocol.contamination_details) {
                body.push(['Kontamination', protocol.contamination_details.types.join(', ')]);
                body.push(['Beschreibung', protocol.contamination_details.description]);
                body.push(['Maßnahmen', protocol.contamination_details.corrective_actions]);
            }
            break;
        case 'fuel':
            body = [
                ['Getankte Liter', `${protocol.liters} L`],
                ['Laderaum-Temperatur', `${protocol.cargo_area_temperature}°C`],
                ['Laderaum geschlossen', protocol.cargo_area_closed ? 'Ja' : 'Nein'],
                ['Siegel vorhanden', protocol.has_seal ? 'Ja' : 'Nein'],
            ];
            break;
        case 'pause':
            body = [
                ['Dauer', `${protocol.duration} min`],
                ['Laderaum-Temperatur', `${protocol.cargo_area_temperature}°C`],
                ['Laderaum geschlossen', protocol.cargo_area_closed ? 'Ja' : 'Nein'],
                ['Siegel vorhanden', protocol.has_seal ? 'Ja' : 'Nein'],
                ['Nachricht', protocol.message || 'Keine'],
            ];
            break;
        case 'loading':
            body = [
                ['Ladedauer', `${protocol.duration} min`],
                ['KM-Stand', protocol.odometer_reading],
                ['Anforderung Temp.', `${protocol.required_temperature}°C`],
                ['Laderaum-Temperatur', `${protocol.cargo_area_temperature}°C`],
                ['Warenart', protocol.goods_type],
                ['Artikel', protocol.articles || 'N/A'],
                ['Menge', protocol.quantity || 'N/A'],
                ['Verpackung', protocol.packaging || 'N/A'],
                ['Gewicht', protocol.weight ? `${protocol.weight} kg` : 'N/A'],
                ['Paletten', protocol.pallets || 'N/A'],
                ['Kisten', protocol.crates || 'N/A'],
                ['Laderaum geschlossen', protocol.cargo_area_closed ? 'Ja' : 'Nein'],
                ['Siegel vorhanden', protocol.has_seal ? 'Ja' : 'Nein'],
            ];
            break;
         case 'delivery':
            body = [
                ['Zugeh. Ladeprotokoll', protocol.loading_protocol_number],
                ['Entladedauer', `${protocol.unloading_duration} min`],
                ['Laderaum-Temperatur', `${protocol.cargo_area_temperature}°C`],
                ['Laderaum geschlossen', protocol.cargo_area_closed ? 'Ja' : 'Nein'],
                ['Siegel vorhanden', protocol.has_seal ? 'Ja' : 'Nein'],
                ['Nachricht', protocol.message || 'Keine'],
            ];
            break;
        case 'emergency':
             body = [
                ['Notfall-Typ', protocol.emergency_type],
                ['Beschreibung', protocol.description],
                ['Referenznummer', protocol.reference_number || 'Keine'],
                ['Hilfe gerufen?', protocol.help_called ? 'Ja' : 'Nein'],
                ['Dauer (Schätzung)', protocol.estimated_duration ? `${protocol.estimated_duration} min` : 'N/A'],
                ['Fahrzeug fahruntüchtig?', protocol.vehicle_immobile ? 'Ja' : 'Nein'],
            ];
            break;
        case 'maintenance':
             body = [
                ['Durchführung', protocol.maintenance_type],
                ['Grund', protocol.reason],
                ['Beschreibung', protocol.description],
                ['Dauer', `${protocol.duration} min`],
                ['KM-Stand', protocol.odometer_reading || 'N/A'],
            ];
            break;
     }
     return { head, body };
  }


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold font-headline text-xl">FahrerLogbuch</span>
          </Link>
        </div>
        
        {isAuthenticated && (
          <div className="flex flex-1 items-center justify-end space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(user)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Angemeldet als</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user} ({userRole})
                    </p>
                  </div>
                </DropdownMenuLabel>
                {activeTour && (
                   <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Aktuelle Tour</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {activeTour.transport_order}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                )}
                <DropdownMenuSeparator />
                {userRole === 'admin' && (
                  <DropdownMenuItem onClick={() => router.push('/admin')}>
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                {activeTour && (
                  <>
                    <DropdownMenuItem onClick={handlePrint} disabled={isPrinting}>
                      {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                      <span>{isPrinting ? 'Druckt...' : 'Drucken & Teilen'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEndTour}>
                      <Map className="mr-2 h-4 w-4" />
                      <span>Tour beenden</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
