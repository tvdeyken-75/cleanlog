

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProtocols } from '@/hooks/useProtocols';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Truck, Building, Key, Hash, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Vehicle } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';
import { VehicleDetailsModal } from './VehicleDetailsModal';


const vehicleSchema = z.object({
  type: z.enum(['truck', 'trailer']),
  license_plate: z.string().min(1, "Kennzeichen ist ein Pflichtfeld."),
  maintenance_number: z.string().min(1, "Wartungsnummer ist ein Pflichtfeld."),
  api_key: z.string().optional(),
});

const editVehicleSchema = vehicleSchema.omit({ type: true });

type VehicleFormValues = z.infer<typeof vehicleSchema>;
type EditVehicleFormValues = z.infer<typeof editVehicleSchema>;

export function VehicleManagementForm() {
  const { user } = useAuth();
  const { addVehicle, vehicles, updateVehicle, updateVehicleStatus } = useProtocols(user);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<{ vehicle: Vehicle; type: 'truck' | 'trailer' } | null>(null);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: 'truck',
      license_plate: '',
      maintenance_number: '',
      api_key: '',
    },
  });

  const editForm = useForm<EditVehicleFormValues>({
    resolver: zodResolver(editVehicleSchema),
  });


  const handleAddNewVehicle = (data: VehicleFormValues) => {
    const success = addVehicle(data.type, {
        license_plate: data.license_plate,
        maintenance_number: data.maintenance_number,
        api_key: data.api_key,
    });
    if (success) {
        toast({
        title: "Fahrzeug hinzugefügt",
        description: `Das Fahrzeug ${data.license_plate} wurde erfolgreich hinzugefügt.`,
        });
        form.reset();
    } else {
        toast({
            title: "Fehler",
            description: `Ein Fahrzeug mit dem Kennzeichen ${data.license_plate} existiert bereits.`,
            variant: "destructive"
        });
    }
  };

  const handleEditClick = (vehicle: Vehicle, type: 'truck' | 'trailer') => {
    setEditingVehicle({ vehicle, type });
    editForm.reset({
        license_plate: vehicle.license_plate,
        maintenance_number: vehicle.maintenance_number,
        api_key: vehicle.api_key || '',
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDetailsClick = (vehicle: Vehicle, type: 'truck' | 'trailer') => {
    setEditingVehicle({ vehicle, type });
    setIsDetailsModalOpen(true);
  };


  const handleUpdateVehicle = (data: EditVehicleFormValues) => {
    if (!editingVehicle) return;

    const originalLicensePlate = editingVehicle.vehicle.license_plate;
    
    updateVehicle(editingVehicle.type, originalLicensePlate, {
        license_plate: data.license_plate,
        maintenance_number: data.maintenance_number,
        api_key: data.api_key,
    });
    toast({
      title: "Fahrzeug aktualisiert",
      description: `Das Fahrzeug ${data.license_plate} wurde erfolgreich aktualisiert.`,
    });
    setIsEditDialogOpen(false);
    setEditingVehicle(null);
  };

  const handleSaveDetails = (originalLicensePlate: string, data: Partial<Vehicle>) => {
    if (!editingVehicle) return;
    updateVehicle(editingVehicle.type, originalLicensePlate, data);
     toast({
      title: "Fahrzeugdetails gespeichert",
      description: `Die Details für ${data.license_plate || originalLicensePlate} wurden aktualisiert.`,
    });
    setIsDetailsModalOpen(false);
  }
  
  const handleStatusChange = (type: 'truck' | 'trailer', license_plate: string, active: boolean) => {
    updateVehicleStatus(type, license_plate, active);
    toast({
        title: "Status aktualisiert",
        description: `Das Fahrzeug ${license_plate} ist nun ${active ? 'aktiv' : 'inaktiv'}.`,
    })
  }

  const trucks = vehicles.truck.sort((a,b) => a.license_plate.localeCompare(b.license_plate));
  const trailers = vehicles.trailer.sort((a,b) => a.license_plate.localeCompare(b.license_plate));

  return (
    <div className='space-y-6'>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddNewVehicle)} className="space-y-4">
            <div className='flex items-end gap-4'>
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
            </div>
             <div className='flex items-end gap-4'>
                <FormField
                control={form.control}
                name="maintenance_number"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <LabelWithTooltip tooltipText="Wartungsnummer des Fahrzeugs" className='flex items-center gap-2'><Hash className='w-4 h-4'/>Wartungsnummer</LabelWithTooltip>
                    <FormControl>
                        <Input placeholder="Wartungsnummer" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="api_key"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <LabelWithTooltip tooltipText="API Key für externe Dienste (optional)" className='flex items-center gap-2'><Key className='w-4 h-4' />API Key</LabelWithTooltip>
                    <FormControl>
                        <Input placeholder="API Key" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <Button type="submit">
            <PlusCircle className="mr-2 h-4 w-4" />
            Fahrzeug hinzufügen
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
                    <ScrollArea className='h-60 rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kennzeichen</TableHead>
                                    <TableHead>Wartungs-Nr.</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Aktion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trucks.length > 0 ? (
                                    trucks.map(truck => (
                                        <TableRow key={truck.license_plate} className={cn(!truck.active && "text-muted-foreground bg-muted/20")}>
                                            <TableCell className='font-medium cursor-pointer hover:underline' onClick={() => handleDetailsClick(truck, 'truck')}>{truck.license_plate}</TableCell>
                                            <TableCell>{truck.maintenance_number}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={truck.active}
                                                    onCheckedChange={(checked) => handleStatusChange('truck', truck.license_plate, checked)}
                                                    aria-label="Fahrzeugstatus"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(truck, 'truck')}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className='text-center text-muted-foreground'>Keine LKWs vorhanden.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                 <div>
                    <h3 className='font-medium flex items-center gap-2 mb-2'><Building className='h-5 w-5 text-primary' />Anhänger ({trailers.length})</h3>
                     <ScrollArea className='h-60 rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kennzeichen</TableHead>
                                    <TableHead>Wartungs-Nr.</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Aktion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trailers.length > 0 ? (
                                    trailers.map(trailer => (
                                        <TableRow key={trailer.license_plate} className={cn(!trailer.active && "text-muted-foreground bg-muted/20")}>
                                            <TableCell className='font-medium cursor-pointer hover:underline' onClick={() => handleDetailsClick(trailer, 'trailer')}>{trailer.license_plate}</TableCell>
                                            <TableCell>{trailer.maintenance_number}</TableCell>
                                             <TableCell>
                                                <Switch
                                                    checked={trailer.active}
                                                    onCheckedChange={(checked) => handleStatusChange('trailer', trailer.license_plate, checked)}
                                                    aria-label="Fahrzeugstatus"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(trailer, 'trailer')}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                   ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className='text-center text-muted-foreground'>Keine Anhänger vorhanden.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Fahrzeug bearbeiten</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleUpdateVehicle)} className="space-y-4">
                        <FormField
                            control={editForm.control}
                            name="license_plate"
                            render={({ field }) => (
                                <FormItem>
                                    <LabelWithTooltip tooltipText="Kennzeichen">Kennzeichen</LabelWithTooltip>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={editForm.control}
                            name="maintenance_number"
                            render={({ field }) => (
                                <FormItem>
                                    <LabelWithTooltip tooltipText="Wartungsnummer">Wartungsnummer</LabelWithTooltip>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={editForm.control}
                            name="api_key"
                            render={({ field }) => (
                                <FormItem>
                                    <LabelWithTooltip tooltipText="API Key (optional)">API Key (optional)</LabelWithTooltip>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Abbrechen</Button>
                            </DialogClose>
                            <Button type="submit">Speichern</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        
        {editingVehicle && (
            <VehicleDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                vehicle={editingVehicle.vehicle}
                vehicleType={editingVehicle.type}
                onSave={handleSaveDetails}
            />
        )}
    </div>
  );
}

    
