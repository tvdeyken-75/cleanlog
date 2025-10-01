
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';


import { LocationInput } from './LocationInput';
import { ArrowLeft, Truck, Fuel, Thermometer, MapPin, CircleCheck, Lock, Award, CalendarClock, ChevronsUpDown, Gauge } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

const fuelProtocolFormSchema = z.object({
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  liters: z.coerce.number({ invalid_type_error: "Liter muss eine Zahl sein." }).positive("Liter muss eine positive Zahl sein."),
  odometer_reading: z.coerce.number().positive("Kilometerstand muss eine positive Zahl sein."),
  cargo_area_temperature: z.coerce.number({ invalid_type_error: "Temperatur muss eine Zahl sein." }).min(-50, "Temperatur zu niedrig").max(50, "Temperatur zu hoch"),
  cargo_area_closed: z.boolean().default(false),
  has_seal: z.boolean().default(false),
});

type FuelProtocolFormValues = z.infer<typeof fuelProtocolFormSchema>;

export function FuelProtocolForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour } = useTour();
  const { addProtocol } = useProtocols(user);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState("");
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);

  const form = useForm<FuelProtocolFormValues>({
    resolver: zodResolver(fuelProtocolFormSchema),
    defaultValues: {
      location: '',
      liters: 0,
      odometer_reading: undefined,
      cargo_area_temperature: 5,
      cargo_area_closed: false,
      has_seal: false,
    }
  });
  
  const watchCargoAreaTemp = form.watch('cargo_area_temperature');

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

  const onSubmit = (data: FuelProtocolFormValues) => {
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
    }, 'fuel');

    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Tankprotokoll wurde erfolgreich hinzugefügt.",
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
          <h1 className="text-2xl font-bold font-headline">Neues Tankprotokoll</h1>
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
            <CardTitle className="flex items-center gap-2"><Fuel className="text-primary"/>Tankdetails</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="liters"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Заправленные литры">Getankte Liter</LabelWithTooltip>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 350" className="pr-10"/></FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">Liter</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="odometer_reading"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Показания одометра" className="flex items-center gap-2"><Gauge className="h-4 w-4"/>Kilometerstand</LabelWithTooltip>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 123456" className="pr-8"/></FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">km</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <LabelWithTooltip tooltipText="Место" className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort</LabelWithTooltip>
                    <FormControl><LocationInput value={field.value} onChange={field.onChange} /></FormControl>
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
                  <div className="flex justify-between items-center">
                    <LabelWithTooltip tooltipText="Температура в грузовом отсеке" className="flex items-center gap-2"><Thermometer className="h-4 w-4"/>Temperatur des Laderaums</LabelWithTooltip>
                    <span className="font-bold text-lg">{watchCargoAreaTemp}°C</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={-25}
                      max={30}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <FormField
                control={form.control}
                name="cargo_area_closed"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between sm:justify-start sm:gap-4 rounded-lg border p-3 w-full">
                        <LabelWithTooltip htmlFor="fuel_cargo_area_closed" tooltipText="Грузовой отсек заперт" className="font-normal flex items-center gap-2">
                            <Lock className="h-4 w-4"/>
                            Laderaum abgeschlossen
                        </LabelWithTooltip>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} id="fuel_cargo_area_closed" />
                        </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="has_seal"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between sm:justify-start sm:gap-4 rounded-lg border p-3 w-full">
                        <LabelWithTooltip htmlFor="fuel_has_seal" tooltipText="Пломба в наличии" className="font-normal flex items-center gap-2">
                            <Award className="h-4 w-4"/>
                            Siegel vorhanden
                        </LabelWithTooltip>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} id="fuel_has_seal" />
                        </FormControl>
                    </FormItem>
                )}
                />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Tankprotokoll abschließen"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}
