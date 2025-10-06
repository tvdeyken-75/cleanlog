
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { Vehicle } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LabelWithTooltip } from "../ui/label-with-tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";

const vehicleDetailsSchema = z.object({
  // Basic Info
  license_plate: z.string().min(1, "Kennzeichen ist ein Pflichtfeld."),
  maintenance_number: z.string().min(1, "Wartungsnummer ist ein Pflichtfeld."),
  api_key: z.string().optional(),

  // Detailed Info
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  vin: z.string().optional(), // Vehicle Identification Number
  first_registration: z.string().optional(), // Date string

  // Inspection Dates
  next_hu: z.string().optional(), // Hauptuntersuchung
  next_sp: z.string().optional(), // Sicherheitsprüfung
  next_uvv: z.string().optional(), // Unfallverhütungsvorschrift
  tachograph_check: z.string().optional(), // Tachoprüfung

  // Technical Specs
  payload_kg: z.coerce.number().optional(),
  gross_vehicle_weight_kg: z.coerce.number().optional(),
  length_m: z.coerce.number().optional(),
  width_m: z.coerce.number().optional(),
  height_m: z.coerce.number().optional(),
  axles: z.coerce.number().optional(),

  // Trailer specific
  cooling_unit: z.string().optional(),
  operating_hours: z.coerce.number().optional(),

  // Administrative
  owner: z.string().optional(),
  insurance_number: z.string().optional(),
  green_sticker: z.boolean().optional(),
});


type VehicleDetailsFormValues = z.infer<typeof vehicleDetailsSchema>;

interface VehicleDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle;
    vehicleType: 'truck' | 'trailer';
    onSave: (originalLicensePlate: string, data: Partial<Vehicle>) => void;
}

export function VehicleDetailsModal({ isOpen, onClose, vehicle, vehicleType, onSave }: VehicleDetailsModalProps) {
    const form = useForm<VehicleDetailsFormValues>({
        resolver: zodResolver(vehicleDetailsSchema),
        defaultValues: {},
    });
    
    useEffect(() => {
        if(vehicle) {
            form.reset({
                ...vehicle,
                length_m: vehicle.dimensions_m?.length,
                width_m: vehicle.dimensions_m?.width,
                height_m: vehicle.dimensions_m?.height,
            });
        }
    }, [vehicle, form])


    function onSubmit(data: VehicleDetailsFormValues) {
        const { length_m, width_m, height_m, ...restData } = data;
        const finalData: Partial<Vehicle> = {
            ...restData,
            dimensions_m: {
                length: length_m,
                width: width_m,
                height: height_m,
            }
        };
        onSave(vehicle.license_plate, finalData);
    }
    
    return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Fahrzeugdetails für: {vehicle.license_plate}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <ScrollArea className="max-h-[70vh] p-1 pr-6">
                            <div className="space-y-6 p-4">
                                
                                <h3 className="text-lg font-medium border-b pb-2">Basisinformationen</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField control={form.control} name="license_plate" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Amtliches Kennzeichen">Kennzeichen</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="manufacturer" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Hersteller des Fahrzeugs">Hersteller</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="model" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Modellbezeichnung">Modell</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="vin" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Fahrgestellnummer">Fahrgestellnummer (VIN)</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="first_registration" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Datum der Erstzulassung">Erstzulassung</LabelWithTooltip><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                
                                <Separator />

                                <h3 className="text-lg font-medium border-b pb-2">Prüftermine</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField control={form.control} name="next_hu" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Nächste Hauptuntersuchung">Nächste HU</LabelWithTooltip><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="next_sp" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Nächste Sicherheitsprüfung">Nächste SP</LabelWithTooltip><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="tachograph_check" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Nächste Tachoprüfung">Tachoprüfung</LabelWithTooltip><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="next_uvv" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Nächste UVV-Prüfung">Nächste UVV</LabelWithTooltip><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                
                                <Separator />

                                <h3 className="text-lg font-medium border-b pb-2">Technische Daten</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="payload_kg" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Nutzlast in kg">Nutzlast (kg)</LabelWithTooltip><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="gross_vehicle_weight_kg" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Zulässiges Gesamtgewicht in kg">zul. Gesamtgewicht (kg)</LabelWithTooltip><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="axles" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Anzahl der Achsen">Anzahl Achsen</LabelWithTooltip><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <FormField control={form.control} name="length_m" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Länge in Metern">Länge (m)</LabelWithTooltip><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="width_m" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Breite in Metern">Breite (m)</LabelWithTooltip><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="height_m" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Höhe in Metern">Höhe (m)</LabelWithTooltip><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>

                                {vehicleType === 'trailer' && (
                                    <>
                                        <Separator />
                                        <h3 className="text-lg font-medium border-b pb-2">Anhänger-Spezifika</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="cooling_unit" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Kühlaggregat-Typ">Kühlaggregat</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="operating_hours" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Betriebsstunden des Aggregats">Betriebsstunden</LabelWithTooltip><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    </>
                                )}
                                
                                <Separator />

                                <h3 className="text-lg font-medium border-b pb-2">Verwaltung</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField control={form.control} name="maintenance_number" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Interne Wartungsnummer">Wartungsnummer</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="api_key" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="API-Schlüssel für externe Dienste">API-Schlüssel</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="owner" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Eigentümer des Fahrzeugs">Fahrzeughalter</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="insurance_number" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Versicherungsnummer">Versicherungsnummer</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                      <FormField
                                        control={form.control}
                                        name="green_sticker"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                <LabelWithTooltip tooltipText="Hat das Fahrzeug eine grüne Umweltplakette?">Grüne Plakette</LabelWithTooltip>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                        />
                                 </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="outline">Abbrechen</Button></DialogClose>
                            <Button type="submit">Speichern</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
