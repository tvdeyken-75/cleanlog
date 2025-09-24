
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProtocols } from '@/hooks/useProtocols';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Truck, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

const vehicleSchema = z.object({
  type: z.enum(['truck', 'trailer']),
  license_plate: z.string().min(1, "Kennzeichen ist ein Pflichtfeld."),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export function VehicleManagementForm() {
  const { user } = useAuth();
  const { addVehicle, getUniqueLicensePlates } = useProtocols(user);
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

  const trucks = getUniqueLicensePlates('truck');
  const trailers = getUniqueLicensePlates('trailer');

  return (
    <div className='space-y-6'>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
            <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
                <FormItem>
                <LabelWithTooltip tooltipText="Тип транспортного средства">Fahrzeugtyp</LabelWithTooltip>
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
                <LabelWithTooltip tooltipText="Новый номерной знак">Neues Kennzeichen</LabelWithTooltip>
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
        <Separator />
        <Card>
            <CardHeader>
                <CardTitle>Vorhandene Fahrzeuge</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                    <h3 className='font-medium flex items-center gap-2 mb-2'><Truck className='h-5 w-5 text-primary' />LKW ({trucks.length})</h3>
                    <ScrollArea className='h-48 rounded-md border p-4'>
                        <div className='flex flex-wrap gap-2'>
                            {trucks.length > 0 ? (
                                trucks.map(plate => <Badge key={plate} variant='secondary'>{plate}</Badge>)
                            ) : (
                                <p className='text-sm text-muted-foreground'>Keine LKWs vorhanden.</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                 <div>
                    <h3 className='font-medium flex items-center gap-2 mb-2'><Building className='h-5 w-5 text-primary' />Anhänger ({trailers.length})</h3>
                    <ScrollArea className='h-48 rounded-md border p-4'>
                        <div className='flex flex-wrap gap-2'>
                           {trailers.length > 0 ? (
                                trailers.map(plate => <Badge key={plate} variant='secondary'>{plate}</Badge>)
                            ) : (
                                <p className='text-sm text-muted-foreground'>Keine Anhänger vorhanden.</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>

    </div>
  );
}
