"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProtocols } from '@/hooks/useProtocols';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const vehicleSchema = z.object({
  type: z.enum(['truck', 'trailer']),
  license_plate: z.string().min(1, "Kennzeichen ist ein Pflichtfeld."),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export function VehicleManagementForm() {
  const { addVehicle } = useProtocols(null);
  const { toast } = useToast();

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: 'truck',
      license_plate: '',
    },
  });

  const onSubmit = (data: VehicleFormValues) => {
    addVehicle(data.type, data.license_plate);
    toast({
      title: "Fahrzeug hinzugefügt",
      description: `Das Kennzeichen ${data.license_plate} wurde erfolgreich hinzugefügt.`,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fahrzeugtyp</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="truck">LKW</SelectItem>
                      <SelectItem value="trailer">Anhänger</SelectItem>
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="license_plate"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Neues Kennzeichen</FormLabel>
              <FormControl>
                <Input placeholder="z.B. B-XY-123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          <PlusCircle className="mr-2 h-4 w-4" />
          Hinzufügen
        </Button>
      </form>
    </Form>
  );
}
