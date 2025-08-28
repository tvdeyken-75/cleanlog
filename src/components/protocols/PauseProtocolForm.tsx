"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/context/AuthContext';
import { useProtocols } from '@/hooks/useProtocols';
import { useToast } from '@/hooks/use-toast';
import { useTour } from '@/context/TourContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { LocationInput } from './LocationInput';
import { ArrowLeft, Truck, Thermometer, MapPin, CircleCheck, Lock, Award, Coffee, MessageSquare, Timer, CalendarClock, ChevronsUpDown } from 'lucide-react';

const pauseProtocolFormSchema = z.object({
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  duration: z.coerce.number({ invalid_type_error: "Dauer muss eine Zahl sein." }).positive("Dauer muss eine positive Zahl sein."),
  message: z.string().optional(),
  cargo_area_temperature: z.coerce.number({ invalid_type_error: "Temperatur muss eine Zahl sein." }).min(-50, "Temperatur zu niedrig").max(50, "Temperatur zu hoch"),
  cargo_area_closed: z.boolean().default(false),
  has_seal: z.boolean().default(false),
});

type PauseProtocolFormValues = z.infer<typeof pauseProtocolFormSchema>;

export function PauseProtocolForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour } = useTour();
  const { addProtocol } = useProtocols(user);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState("");
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);

  const form = useForm<PauseProtocolFormValues>({
    resolver: zodResolver(pauseProtocolFormSchema),
    defaultValues: {
      location: '',
      cargo_area_closed: false,
      has_seal: false,
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'medium' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const onSubmit = (data: PauseProtocolFormValues) => {
    if (!activeTour) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Keine aktive Tour gefunden. Bitte starten Sie eine neue Tour.",
      });
      return;
    }
    
    addProtocol({
        ...data,
        truck_license_plate: activeTour.truck_license_plate,
        trailer_license_plate: activeTour.trailer_license_plate,
        transport_order: activeTour.transport_order,
        message: data.message || "",
    }, 'pause');

    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Pausenprotokoll wurde erfolgreich hinzugefügt.",
    });
    router.push('/');
  };
  
  if (authLoading || !isAuthenticated || !activeTour) {
    return (
      <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold font-headline">Neues Pausenprotokoll</h1>
        </div>
        
        <Collapsible open={isTourInfoOpen} onOpenChange={setIsTourInfoOpen}>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Truck className="text-primary"/>Tour-Informationen</CardTitle>
                  <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                          <ChevronsUpDown className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                      </Button>
                  </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">LKW</p>
                            <p className="font-medium">{activeTour.truck_license_plate}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Anhänger</p>
                            <p className="font-medium">{activeTour.trailer_license_plate}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Transportauftrag</p>
                            <p className="font-medium">{activeTour.transport_order}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground flex items-center gap-1.5"><CalendarClock className="h-4 w-4"/>Datum & Zeit</p>
                            <p className="font-medium">{currentTime || "..."}</p>
                        </div>
                    </div>
                </CardContent>
              </CollapsibleContent>
          </Card>
        </Collapsible>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Coffee className="text-primary"/>Pausendetails</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" />Dauer der Pause</FormLabel>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 45" className="pr-12"/></FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">Minuten</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort</FormLabel>
                    <FormControl><LocationInput value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2"><MessageSquare className="h-4 w-4"/>Meldung (optional)</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Besondere Vorkommnisse während der Pause..." /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="text-primary"/>Laderaum-Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="cargo_area_temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Thermometer className="h-4 w-4"/>Temperatur des Laderaums</FormLabel>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 2" className="pr-8"/></FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">°C</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-8">
                <FormField
                control={form.control}
                name="cargo_area_closed"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id="cargo_area_closed" />
                        </FormControl>
                        <FormLabel htmlFor="cargo_area_closed" className="font-normal flex items-center gap-2">
                            <Lock className="h-4 w-4"/>
                            Laderaum abgeschlossen
                        </FormLabel>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="has_seal"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id="has_seal" />
                        </FormControl>
                        <FormLabel htmlFor="has_seal" className="font-normal flex items-center gap-2">
                            <Award className="h-4 w-4"/>
                            Siegel vorhanden
                        </FormLabel>
                    </FormItem>
                )}
                />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Pausenprotokoll abschließen"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}
