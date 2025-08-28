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
import type { LoadingProtocol } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { LocationInput } from './LocationInput';
import { ArrowLeft, Truck, Thermometer, MapPin, CircleCheck, Lock, Award, PackageCheck, MessageSquare, Timer, CalendarClock, ChevronsUpDown, PackageSearch } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

const deliveryProtocolFormSchema = z.object({
  loading_protocol_number: z.string({ required_error: "Ladeprotokoll ist ein Pflichtfeld." }),
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  unloading_duration: z.coerce.number().positive("Dauer muss eine positive Zahl sein."),
  message: z.string().optional(),
  cargo_area_temperature: z.coerce.number(),
  cargo_area_closed: z.boolean().default(false),
  has_seal: z.boolean().default(false),
});

type DeliveryProtocolFormValues = z.infer<typeof deliveryProtocolFormSchema>;

export function DeliveryProtocolForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour } = useTour();
  const { protocols, addProtocol } = useProtocols(user);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState("");
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);

  const form = useForm<DeliveryProtocolFormValues>({
    resolver: zodResolver(deliveryProtocolFormSchema),
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

  const onSubmit = (data: DeliveryProtocolFormValues) => {
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
    }, 'delivery');

    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Lieferprotokoll wurde erfolgreich hinzugefügt.",
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

  const loadingProtocolsForTour = protocols.filter(p => p.type === 'loading' && p.transport_order === activeTour.transport_order) as LoadingProtocol[];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold font-headline">Neues Lieferprotokoll</h1>
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
            <CardTitle className="flex items-center gap-2"><PackageCheck className="text-primary"/>Lieferdetails</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="loading_protocol_number"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Соответствующий протокол погрузки" className="flex items-center gap-2"><PackageSearch className="h-4 w-4" />Zugehöriges Ladeprotokoll</LabelWithTooltip>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie das Ladeprotokoll" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {loadingProtocolsForTour.length > 0 ? (
                            loadingProtocolsForTour.map(p => (
                                <SelectItem key={p.id} value={p.loading_protocol_number}>
                                    {p.loading_protocol_number} ({p.articles || p.goods_type})
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="none" disabled>Keine Ladeprotokolle für diese Tour</SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <LabelWithTooltip tooltipText="Место доставки" className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort der Lieferung</LabelWithTooltip>
                    <FormControl><LocationInput value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="unloading_duration"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Продолжительность разгрузки" className="flex items-center gap-2"><Timer className="h-4 w-4" />Dauer der Entladung</LabelWithTooltip>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 30" className="pr-12"/></FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">Minuten</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <LabelWithTooltip tooltipText="Сообщение / Примечание (необязательно)" className="flex items-center gap-2"><MessageSquare className="h-4 w-4"/>Meldung / Anmerkung (optional)</LabelWithTooltip>
                    <FormControl><Textarea {...field} placeholder="Besondere Vorkommnisse bei der Lieferung..." /></FormControl>
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
                  <LabelWithTooltip tooltipText="Температура в грузовом отсеке" className="flex items-center gap-2"><Thermometer className="h-4 w-4"/>Temperatur des Laderaums</LabelWithTooltip>
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
                        <LabelWithTooltip htmlFor="cargo_area_closed" tooltipText="Грузовой отсек заперт" className="font-normal flex items-center gap-2">
                            <Lock className="h-4 w-4"/>
                            Laderaum abgeschlossen
                        </LabelWithTooltip>
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
                        <LabelWithTooltip htmlFor="has_seal" tooltipText="Пломба в наличии" className="font-normal flex items-center gap-2">
                            <Award className="h-4 w-4"/>
                            Siegel vorhanden
                        </LabelWithTooltip>
                    </FormItem>
                )}
                />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Lieferprotokoll abschließen"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}
