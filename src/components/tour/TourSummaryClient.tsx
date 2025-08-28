
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTour } from '@/context/TourContext';
import { useProtocols } from '@/hooks/useProtocols';
import { ProtocolsTable } from '../dashboard/ProtocolsTable';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Loader2, FileDown, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function TourSummaryClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour, endTour, isLoading: tourLoading } = useTour();
  const { protocols, isLoading: protocolsLoading } = useProtocols(user);
  
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    } else if (!tourLoading && !activeTour) {
      toast({ title: "Keine aktive Tour", description: "Sie wurden zum Tour-Auswahlbildschirm weitergeleitet.", variant: "destructive" });
      router.replace('/tour-selection');
    }
  }, [authLoading, isAuthenticated, tourLoading, activeTour, router, toast]);

  const isLoading = authLoading || tourLoading || protocolsLoading;

  if (isLoading || !activeTour) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const tourProtocols = protocols.filter(p => p.transport_order === activeTour.transport_order);

  const getTourSummaryData = () => {
    return {
      tour: activeTour,
      protocols: tourProtocols,
      driver: user,
      endDate: new Date().toISOString(),
    };
  };

  const handleSaveToFile = () => {
    const data = getTourSummaryData();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `tour-summary-${activeTour.transport_order}.json`;
    link.click();
    toast({ title: "Datei gespeichert", description: "Die Tourzusammenfassung wurde heruntergeladen." });
  };
  
  const handleSendToApi = async () => {
    setIsSending(true);
    const summaryData = getTourSummaryData();
    
    try {
        const response = await fetch('/api/tour-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(summaryData),
        });

        if (!response.ok) {
            throw new Error(`API-Fehler: ${response.statusText}`);
        }

        const result = await response.json();
        toast({
            title: "Daten gesendet",
            description: result.message || "Tourdaten erfolgreich an die API gesendet.",
        });

    } catch (error) {
        console.error("Fehler beim Senden der Daten an die API", error);
        toast({
            title: "API-Fehler",
            description: "Die Tourdaten konnten nicht gesendet werden.",
            variant: "destructive",
        });
    } finally {
        setIsSending(false);
    }
  };


  const handleFinishTour = () => {
    endTour();
    toast({ title: "Tour beendet", description: "Sie können nun eine neue Tour starten." });
    router.push('/tour-selection');
  };

  return (
    <div className="container max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Tour-Zusammenfassung</CardTitle>
          <CardDescription>Übersicht der Protokolle für den Transportauftrag: <strong>{activeTour.transport_order}</strong></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">LKW</p>
              <p className="font-bold text-lg">{activeTour.truck_license_plate}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">Anhänger</p>
              <p className="font-bold text-lg">{activeTour.trailer_license_plate}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">Fahrer</p>
              <p className="font-bold text-lg">{user}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Protokoll-Liste</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ProtocolsTable protocols={tourProtocols} isLoading={protocolsLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Aktionen</CardTitle>
            <CardDescription>Speichern oder senden Sie die Tourdaten, bevor Sie die Tour abschließen.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleSaveToFile} variant="outline" size="lg">
                <FileDown className="mr-2 h-5 w-5" />
                Als Datei speichern
            </Button>
            <Button onClick={handleSendToApi} variant="outline" size="lg" disabled={isSending}>
                {isSending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                An API senden
            </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="lg">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Tour endgültig abschließen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion beendet die aktuelle Tour. Sie können danach keine weiteren Protokolle für diesen Transportauftrag erstellen. Stellen Sie sicher, dass Sie alle Daten gespeichert oder gesendet haben.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinishTour}>
                Ja, Tour abschließen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
