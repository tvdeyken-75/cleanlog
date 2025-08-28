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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { LocationInput } from './LocationInput';
import { ArrowLeft, Sparkles, Truck, ClipboardList, Thermometer, Droplets, MapPin, AlertTriangle, CircleCheck, CalendarClock, ChevronsUpDown } from 'lucide-react';

const contaminationTypes = [
  { id: 'chemical', label: 'Chemisch (Reinigungsmittelrückstand)' },
  { id: 'biological', label: 'Biologisch (Biofilm, Schimmel)' },
  { id: 'rust', label: 'Rost' },
  { id: 'dirt', label: 'Sand/Erde' },
  { id: 'foreign', label: 'Fremdkörper' },
  { id: 'other', label: 'Sonstiges' },
];

const protocolFormSchema = z.object({
  cleaning_type: z.string({ required_error: "Art der Reinigung ist ein Pflichtfeld." }),
  cleaning_products: z.string().min(1, "Reinigungsmittel ist ein Pflichtfeld."),
  control_type: z.string({ required_error: "Art der Kontrolle ist ein Pflichtfeld." }),
  control_result: z.enum(["i.O.", "n.i.O."], { required_error: "Ergebnis ist ein Pflichtfeld." }),
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  water_temperature: z.coerce.number({ invalid_type_error: "Temperatur muss eine Zahl sein." }).min(-50, "Temperatur zu niedrig").max(120, "Temperatur zu hoch"),
  water_quality: z.string({ required_error: "Wasserqualität ist ein Pflichtfeld." }),
  contamination_types: z.array(z.string()).optional(),
  contamination_description: z.string().optional(),
  corrective_actions: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.control_result === 'n.i.O.') {
    if (!data.contamination_types || data.contamination_types.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mindestens eine Art der Kontamination muss ausgewählt werden.", path: ['contamination_types'] });
    }
    if (!data.contamination_description?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Beschreibung der Kontamination ist ein Pflichtfeld.", path: ['contamination_description'] });
    }
    if (!data.corrective_actions?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Korrekturmaßnahmen sind ein Pflichtfeld.", path: ['corrective_actions'] });
    }
  }
});

type ProtocolFormValues = z.infer<typeof protocolFormSchema>;

export function ProtocolForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour } = useTour();
  const { addProtocol } = useProtocols(user);
  const { toast } = useToast();
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [currentTime, setCurrentTime] = useState("");
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);

  const form = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolFormSchema),
    defaultValues: {
      contamination_types: [],
      location: '',
    }
  });

  const watchControlResult = form.watch('control_result');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'medium' }));
    }, 1000);
    setStartTime(new Date().toISOString()); // Keep start time for saving
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const onSubmit = (data: ProtocolFormValues) => {
    if (!activeTour) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Keine aktive Tour gefunden. Bitte starten Sie eine neue Tour.",
      });
      return;
    }

    const protocolData = {
      truck_license_plate: activeTour.truck_license_plate,
      trailer_license_plate: activeTour.trailer_license_plate,
      transport_order: activeTour.transport_order,
      cleaning_type: data.cleaning_type,
      cleaning_products: data.cleaning_products,
      control_type: data.control_type,
      control_result: data.control_result,
      location: data.location,
      water_temperature: data.water_temperature,
      water_quality: data.water_quality,
      start_time: startTime,
      contamination_details: data.control_result === 'n.i.O.' ? {
        types: data.contamination_types || [],
        description: data.contamination_description || '',
        corrective_actions: data.corrective_actions || '',
      } : undefined,
    };
    addProtocol(protocolData, 'cleaning');
    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Reinigungsprotokoll wurde erfolgreich hinzugefügt.",
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
          <h1 className="text-2xl font-bold font-headline">Neues Reinigungsprotokoll</h1>
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
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>Reinigungsdetails</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="cleaning_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Art der Reinigung</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Wählen Sie eine Art" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tägliche Reinigung">Tägliche Reinigung</SelectItem>
                      <SelectItem value="Grundreinigung">Grundreinigung</SelectItem>
                      <SelectItem value="Desinfektion nach Ladungsart">Desinfektion nach Ladungsart</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cleaning_products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verwendete Reinigungs-/Desinfektionsmittel</FormLabel>
                  <FormControl><Input {...field} placeholder="z.B. Desinfekto-123" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="text-primary"/>Qualitätskontrolle</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="control_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Art der Kontrolle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie eine Art" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Visuell">Visuell</SelectItem>
                      <SelectItem value="Abklatschprobe">Abklatschprobe</SelectItem>
                      <SelectItem value="ATP-Messung">ATP-Messung</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="control_result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ergebnis der Kontrolle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie ein Ergebnis" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="i.O.">i.O. (in Ordnung)</SelectItem>
                      <SelectItem value="n.i.O.">n.i.O. (nicht in Ordnung)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {watchControlResult === 'n.i.O.' && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/>Meldung Kontamination</CardTitle>
              <CardDescription>Dieses Feld ist bei einem "n.i.O."-Ergebnis auszufüllen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="contamination_types"
                  render={() => (
                    <FormItem>
                      <FormLabel>Art der Kontamination</FormLabel>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {contaminationTypes.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="contamination_types"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(field.value?.filter((value) => value !== item.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="contamination_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung der festgestellten Kontamination</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Beschreiben Sie die Kontamination im Detail..."/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="corrective_actions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durchgeführte Korrekturmaßnahmen</FormLabel>
                    <FormControl><Textarea {...field} placeholder="z.B. Erneute Reinigung durchgeführt, Werkstatt gemeldet..."/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="text-primary"/>Umgebungsdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                  name="water_temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Thermometer className="h-4 w-4"/>Wassertemperatur</FormLabel>
                      <div className="relative">
                        <FormControl><Input type="number" {...field} placeholder="z.B. 45" className="pr-8"/></FormControl>
                        <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">°C</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="water_quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4"/>Wasserqualität</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie eine Qualität" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Trinkwasserqualität">Trinkwasserqualität</SelectItem>
                      <SelectItem value="Betriebseigenes Wasser">Betriebseigenes Wasser</SelectItem>
                      <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Protokoll abschließen"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}
