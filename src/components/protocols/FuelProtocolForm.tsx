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
import { Skeleton } from '@/components/ui/skeleton';

import { AutocompleteInput } from './AutocompleteInput';
import { LocationInput } from './LocationInput';
import { ArrowLeft, Truck, Fuel, Thermometer, MapPin, CircleCheck, Lock, Award } from 'lucide-react';

const fuelProtocolFormSchema = z.object({
  truck_license_plate: z.string().min(1, "LKW-Kennzeichen ist ein Pflichtfeld."),
  trailer_license_plate: z.string().min(1, "Anhänger-Kennzeichen ist ein Pflichtfeld."),
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  liters: z.coerce.number({ invalid_type_error: "Liter muss eine Zahl sein." }).positive("Liter muss eine positive Zahl sein."),
  cargo_area_temperature: z.coerce.number({ invalid_type_error: "Temperatur muss eine Zahl sein." }).min(-50, "Temperatur zu niedrig").max(50, "Temperatur zu hoch"),
  cargo_area_closed: z.boolean().default(false),
  has_seal: z.boolean().default(false),
});

type FuelProtocolFormValues = z.infer<typeof fuelProtocolFormSchema>;

export function FuelProtocolForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour } = useTour();
  const { addProtocol, getUniqueLicensePlates } = useProtocols(user);
  const { toast } = useToast();
  const [startTime] = useState(new Date().toISOString());

  const form = useForm<FuelProtocolFormValues>({
    resolver: zodResolver(fuelProtocolFormSchema),
    defaultValues: {
      location: '',
      cargo_area_closed: false,
      has_seal: false,
    }
  });
  
  useEffect(() => {
    if (activeTour) {
      form.setValue('truck_license_plate', activeTour.truck_license_plate);
      form.setValue('trailer_license_plate', activeTour.trailer_license_plate);
    }
  }, [activeTour, form]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const onSubmit = (data: FuelProtocolFormValues) => {
    addProtocol({ ...data, transport_order: activeTour?.transport_order || '' }, 'fuel');
    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Tankprotokoll wurde erfolgreich hinzugefügt.",
    });
    router.push('/');
  };
  
  if (authLoading || !isAuthenticated) {
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
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="text-primary"/>Fahrzeugdaten</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="truck_license_plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LKW-Kennzeichen</FormLabel>
                  <FormControl>
                    <AutocompleteInput 
                      value={field.value}
                      onChange={field.onChange}
                      existingPlates={getUniqueLicensePlates('truck')}
                      placeholder="z.B. B-XY-123"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trailer_license_plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anhänger-Kennzeichen</FormLabel>
                  <FormControl>
                    <AutocompleteInput 
                      value={field.value}
                      onChange={field.onChange}
                      existingPlates={getUniqueLicensePlates('trailer')}
                      placeholder="z.B. B-AB-456"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
                  <FormLabel>Getankte Liter</FormLabel>
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
                name="location"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort</FormLabel>
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
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Tankprotokoll abschließen"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}
