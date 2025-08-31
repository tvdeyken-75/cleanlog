
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/context/AuthContext';
import { useTour } from '@/context/TourContext';
import { useProtocols } from '@/hooks/useProtocols';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '../protocols/AutocompleteInput';
import { Play, Wrench } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';

const tourSelectionSchema = z.object({
  truck_license_plate: z.string().optional(),
  trailer_license_plate: z.string().optional(),
  transport_order: z.string().optional(),
  is_maintenance: z.boolean().default(false),
}).refine(data => data.is_maintenance || (data.truck_license_plate && data.trailer_license_plate && data.transport_order), {
    message: "Alle Felder sind für eine Tour erforderlich.",
    path: ["transport_order"], 
}).refine(data => !data.is_maintenance || (data.truck_license_plate || data.trailer_license_plate), {
    message: "Für die Wartung muss mindestens ein LKW oder Anhänger ausgewählt werden.",
    path: ["truck_license_plate"],
});

type TourSelectionFormValues = z.infer<typeof tourSelectionSchema>;

export function TourSelectionForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { startTour, activeTour, isLoading: tourLoading } = useTour();
  const { getUniqueLicensePlates } = useProtocols(user);

  const form = useForm<TourSelectionFormValues>({
    resolver: zodResolver(tourSelectionSchema),
    defaultValues: {
      truck_license_plate: '',
      trailer_license_plate: '',
      transport_order: '',
      is_maintenance: false,
    }
  });

  const isMaintenance = form.watch('is_maintenance');

  useEffect(() => {
    const isLoading = authLoading || tourLoading;
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
    if(!isLoading && activeTour) {
      router.replace('/');
    }
  }, [authLoading, tourLoading, isAuthenticated, activeTour, router]);

  const onSubmit = (data: TourSelectionFormValues) => {
    if (data.is_maintenance) {
        const params = new URLSearchParams();
        if (data.truck_license_plate) params.set('truck', data.truck_license_plate);
        if (data.trailer_license_plate) params.set('trailer', data.trailer_license_plate);
        router.push(`/protocols/maintenance?${params.toString()}`);
    } else {
        startTour({
            truck_license_plate: data.truck_license_plate!,
            trailer_license_plate: data.trailer_license_plate!,
            transport_order: data.transport_order!,
        });
        router.push('/');
    }
  };

  const isLoading = authLoading || tourLoading;

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="is_maintenance"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                </FormControl>
                <div className="space-y-1 leading-none">
                    <LabelWithTooltip tooltipText="Для протокола технического обслуживания/ремонта">
                        Wartungs/Reparaturprotokoll einfüllen
                    </LabelWithTooltip>
                </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="truck_license_plate"
          render={({ field }) => (
            <FormItem>
              <LabelWithTooltip tooltipText="Номерной знак грузовика">LKW-Kennzeichen</LabelWithTooltip>
              <FormControl>
                <AutocompleteInput 
                  value={field.value || ''}
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
              <LabelWithTooltip tooltipText="Номерной знак прицепа">Anhänger-Kennzeichen</LabelWithTooltip>
              <FormControl>
                <AutocompleteInput 
                  value={field.value || ''}
                  onChange={field.onChange}
                  existingPlates={getUniqueLicensePlates('trailer')}
                  placeholder="z.B. B-AB-456"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isMaintenance && (
            <FormField
            control={form.control}
            name="transport_order"
            render={({ field }) => (
                <FormItem>
                <LabelWithTooltip tooltipText="Заказ на перевозку">Transportauftrag</LabelWithTooltip>
                <FormControl>
                    <Input {...field} placeholder="z.B. T-54321" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        <Button type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
            {isMaintenance ? <Wrench className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isMaintenance ? 'Wartungsprotokoll hinzufügen' : 'Tour starten'}
        </Button>
      </form>
    </Form>
  );
}
