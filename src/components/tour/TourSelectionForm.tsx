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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '../protocols/AutocompleteInput';
import { Play } from 'lucide-react';

const tourSelectionSchema = z.object({
  truck_license_plate: z.string().min(1, "LKW-Kennzeichen ist ein Pflichtfeld."),
  trailer_license_plate: z.string().min(1, "Anhänger-Kennzeichen ist ein Pflichtfeld."),
  transport_order: z.string().min(1, "Transportauftrag ist ein Pflichtfeld."),
});

type TourSelectionFormValues = z.infer<typeof tourSelectionSchema>;

export function TourSelectionForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { startTour, activeTour } = useTour();
  const { getUniqueLicensePlates } = useProtocols(user);

  const form = useForm<TourSelectionFormValues>({
    resolver: zodResolver(tourSelectionSchema),
    defaultValues: {
      truck_license_plate: '',
      trailer_license_plate: '',
      transport_order: '',
    }
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
    if(!authLoading && activeTour) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, activeTour, router]);

  const onSubmit = (data: TourSelectionFormValues) => {
    startTour(data);
    router.push('/');
  };

  if (authLoading) {
    return <p>Wird geladen...</p>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <FormField
          control={form.control}
          name="transport_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transportauftrag</FormLabel>
              <FormControl>
                <Input {...field} placeholder="z.B. T-54321" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
            <Play className="mr-2 h-5 w-5" />
            Tour starten
        </Button>
      </form>
    </Form>
  );
}
