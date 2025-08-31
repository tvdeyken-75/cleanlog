
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
import { Protocol } from '@/lib/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

    const tourProtocols = protocols.filter(p => p.transport_order === activeTour.transport_order);

    try {
        const doc = new jsPDF();
        
        // Add Title
        doc.setFontSize(18);
        doc.text("Tour-Zusammenfassung", 14, 22);
        
        // Add Tour Info
        doc.setFontSize(11);
        doc.text(`Transportauftrag: ${activeTour.transport_order}`, 14, 32);
        doc.text(`LKW: ${activeTour.truck_license_plate}`, 14, 38);
        doc.text(`Anhänger: ${activeTour.trailer_license_plate}`, 14, 44);
        doc.text(`Fahrer: ${user}`, 14, 50);

        // Add Protocols Table
        const tableData = tourProtocols.map(p => {
            const date = new Date(p.start_time).toLocaleDateString('de-DE');
            const time = new Date(p.start_time).toLocaleTimeString('de-DE');
            let details = `Typ: ${p.type}`;
            // Add more details based on protocol type
             switch (p.type) {
                case 'cleaning': details = `${p.cleaning_type} an ${p.location}. Ergebnis: ${p.control_result}`; break;
                case 'fuel': details = `${p.liters}L getankt an ${p.location}.`; break;
                case 'pause': details = `${p.duration}min Pause an ${p.location}.`; break;
                case 'loading': details = `Beladung an ${p.location}. Art: ${p.goods_type}`; break;
                case 'delivery': details = `Lieferung an ${p.location}.`; break;
                case 'emergency': details = `Notfall: ${p.emergency_type} an ${p.location}`; break;
                case 'maintenance': details = `Wartung: ${p.reason}`; break;
            }
            return [date, time, details];
        });

        autoTable(doc, {
            startY: 60,
            head: [['Datum', 'Zeit', 'Details']],
            body: tableData,
        });

        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], `tour-summary-${activeTour.transport_order}.pdf`, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
                title: 'Tour-Zusammenfassung',
                text: `Protokolle für Tour ${activeTour.transport_order}`,
                files: [pdfFile],
            });
        } else {
            // Fallback for browsers that don't support sharing files
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
                      <span>{isPrinting ? 'Druckt...' : 'Drucken &amp; Teilen'}</span>
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
