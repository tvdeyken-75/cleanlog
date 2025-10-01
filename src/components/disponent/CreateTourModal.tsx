

"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useProtocols } from "@/hooks/useProtocols";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { format, setHours, setMinutes } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LabelWithTooltip } from "../ui/label-with-tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Truck, User as UserIcon, Building, Briefcase, FileText, MessageSquare, Ticket, ChevronsUpDown, DollarSign, CalendarIcon, StickyNote } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Tour } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";


const tourSchema = z.object({
  tourNr: z.string().min(1, "Tournummer ist ein Pflichtfeld."),
  driver: z.string().min(1, "Fahrer ist ein Pflichtfeld."),
  truck: z.string().min(1, "LKW ist ein Pflichtfeld."),
  trailer: z.string().min(1, "Auflieger ist ein Pflichtfeld."),
  customer: z.string().min(1, "Kunde ist ein Pflichtfeld."),
  description: z.string().optional(),
  remarks: z.string().optional(),
  customerRef: z.string().optional(),
  start_time: z.date().optional(),
  end_time: z.date().optional(),
  // Tourfinanzen fields
  rohertrag: z.coerce.number().optional(),
  anSub: z.coerce.number().optional(),
  km: z.coerce.number().optional(),
  df: z.coerce.number().optional(),
maut: z.coerce.number().optional(),
  rechnungsnummer: z.string().optional(),
  rechnungRaus: z.boolean().optional(),
  bezahlt: z.boolean().optional(),
  bezahldatum: z.date().optional(),
});

type TourFormValues = z.infer<typeof tourSchema>;

interface CreateTourModalProps {
    onTourCreated: () => void;
}

export function CreateTourModal({ onTourCreated }: CreateTourModalProps) {
  const { toast } = useToast();
  const { getUsers, user } = useAuth();
  const { vehicles, addTour, tours } = useProtocols(user);
  const [isFinancesOpen, setIsFinancesOpen] = useState(false);
  const [isMainInfoOpen, setIsMainInfoOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  
  const getNextTourNumber = () => {
    if (!tours || tours.length === 0) {
      return "T-00001";
    }
    const lastTour = tours.reduce((latest, current) => {
      const latestNum = parseInt(latest.tourNr.split('-')[1]);
      const currentNum = parseInt(current.tourNr.split('-')[1]);
      return currentNum > latestNum ? current : latest;
    });

    const lastNumber = parseInt(lastTour.tourNr.split('-')[1]);
    const nextNumber = lastNumber + 1;
    return `T-${String(nextNumber).padStart(5, '0')}`;
  };


  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      tourNr: getNextTourNumber(),
      driver: "",
      truck: "",
      trailer: "",
      customer: "",
      description: "",
      remarks: "",
      customerRef: "",
      start_time: undefined,
      end_time: undefined,
      rohertrag: undefined,
      anSub: undefined,
      km: undefined,
      df: undefined,
      maut: undefined,
      rechnungsnummer: "",
      rechnungRaus: false,
      bezahlt: false,
      bezahldatum: undefined,
    },
  });

  useEffect(() => {
    form.setValue("tourNr", getNextTourNumber());
  }, [tours, form]);

  const drivers = getUsers().filter(u => u.role.includes("driver"));
  const trucks = vehicles.truck.filter(v => v.active);
  const trailers = vehicles.trailer.filter(v => v.active);

  const rohertrag = form.watch('rohertrag') || 0;
  const df = form.watch('df') || 0;
  const rohertragPlusDf = rohertrag * (1 + df / 100);
  const brutto = rohertragPlusDf * 1.19; // Assuming 19% VAT
  const km = form.watch('km') || 0;
  const euroPerKm = km > 0 ? rohertrag / km : 0;

  function onSubmit(data: TourFormValues) {
    addTour(data as Tour);
    toast({
      title: "Tour erstellt",
      description: `Die Tour ${data.tourNr} wurde erfolgreich geplant.`,
    });
    onTourCreated();
    form.reset({
      ...form.getValues(), // keep other values if needed
      tourNr: getNextTourNumber(), // update tour number for next form
    });
  }

  const DateTimePicker = ({ field, label, tooltipText }: { field: any, label: string, tooltipText: string }) => {
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value;
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = setMinutes(setHours(field.value || new Date(), hours), minutes);
        field.onChange(newDate);
    }
    
    return (
        <FormItem>
            <LabelWithTooltip tooltipText={tooltipText} className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" />{label}</LabelWithTooltip>
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                        {field.value ? format(field.value, "PPP") : <span>Datum wählen</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                            if (!date) return;
                            const currentHours = field.value ? new Date(field.value).getHours() : 0;
                            const currentMinutes = field.value ? new Date(field.value).getMinutes() : 0;
                            const newDate = setMinutes(setHours(date, currentHours), currentMinutes);
                            field.onChange(newDate);
                        }}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                 <FormControl>
                    <Input
                        type="time"
                        value={field.value ? format(new Date(field.value), 'HH:mm') : ''}
                        onChange={handleTimeChange}
                        className="w-[120px]"
                    />
                </FormControl>
            </div>
            <FormMessage />
        </FormItem>
    );
};


  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Neue Tour erstellen</DialogTitle>
        <DialogDescription>
          Füllen Sie die Details aus, um eine neue Tour zu planen.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[70vh] p-1">
                <div className="space-y-4 p-4">
                    <Collapsible open={isMainInfoOpen} onOpenChange={setIsMainInfoOpen} className="space-y-2">
                         <CollapsibleTrigger asChild>
                            <Button type="button" variant="ghost" className="w-full justify-between px-2">
                                <span className="font-semibold text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-primary" />Hauptinformationen</span>
                                <ChevronsUpDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 border p-4 rounded-md">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tourNr"
                                    render={({ field }) => (
                                    <FormItem>
                                        <LabelWithTooltip tooltipText="Eindeutige Nummer der Tour" className="flex items-center gap-2"><Ticket className="w-4 h-4" />Tour-Nr.</LabelWithTooltip>
                                        <FormControl>
                                            <Input placeholder="z.B. 2024-001" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="customer"
                                    render={({ field }) => (
                                    <FormItem>
                                        <LabelWithTooltip tooltipText="Der Kunde für diese Tour" className="flex items-center gap-2"><Briefcase className="w-4 h-4" />Kunde</LabelWithTooltip>
                                        <FormControl>
                                            <Input placeholder="Kundenname" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="driver"
                                    render={({ field }) => (
                                    <FormItem>
                                        <LabelWithTooltip tooltipText="Wählen Sie einen Fahrer" className="flex items-center gap-2"><UserIcon className="w-4 h-4" />Fahrer</LabelWithTooltip>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Fahrer auswählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {drivers.map(driver => (
                                            <SelectItem key={driver.username} value={driver.username}>{driver.username}</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                        control={form.control}
                                        name="customerRef"
                                        render={({ field }) => (
                                        <FormItem>
                                            <LabelWithTooltip tooltipText="Referenznummer des Kunden" className="flex items-center gap-2"><FileText className="w-4 h-4" />Kundenreferenz</LabelWithTooltip>
                                            <FormControl>
                                                <Input placeholder="z.B. PO-12345" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="truck"
                                    render={({ field }) => (
                                    <FormItem>
                                        <LabelWithTooltip tooltipText="Wählen Sie einen LKW" className="flex items-center gap-2"><Truck className="w-4 h-4" />LKW</LabelWithTooltip>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="LKW auswählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {trucks.map(truck => (
                                                <SelectItem key={truck.license_plate} value={truck.license_plate}>{truck.license_plate}</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="trailer"
                                    render={({ field }) => (
                                    <FormItem>
                                        <LabelWithTooltip tooltipText="Wählen Sie einen Auflieger" className="flex items-center gap-2"><Building className="w-4 h-4" />Auflieger</LabelWithTooltip>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Auflieger auswählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {trailers.map(trailer => (
                                                <SelectItem key={trailer.license_plate} value={trailer.license_plate}>{trailer.license_plate}</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="start_time"
                                    render={({ field }) => <DateTimePicker field={field} label="Startzeit" tooltipText="Startdatum und -uhrzeit der Tour" />}
                                />
                                <FormField
                                    control={form.control}
                                    name="end_time"
                                    render={({ field }) => <DateTimePicker field={field} label="Endzeit" tooltipText="Enddatum und -uhrzeit der Tour" />}
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                     <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen} className="space-y-2">
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="ghost" className="w-full justify-between px-2">
                                <span className="font-semibold text-lg flex items-center gap-2"><StickyNote className="h-5 w-5 text-primary" />Notizen</span>
                                <ChevronsUpDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 border p-4 rounded-md">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <LabelWithTooltip tooltipText="Kurze Beschreibung der Tour" className="flex items-center gap-2"><FileText className="w-4 h-4" />Beschreibung</LabelWithTooltip>
                                    <FormControl>
                                        <Textarea placeholder="z.B. Fleischtransport von A nach B" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="remarks"
                                render={({ field }) => (
                                <FormItem>
                                    <LabelWithTooltip tooltipText="Interne Bemerkungen zur Tour" className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Bemerkungen</LabelWithTooltip>
                                    <FormControl>
                                        <Textarea placeholder="Besonderheiten oder Anweisungen" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                    
                    <Collapsible open={isFinancesOpen} onOpenChange={setIsFinancesOpen} className="space-y-2">
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="ghost" className="w-full justify-between px-2">
                                <span className="font-semibold text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" />Tourfinanzen</span>
                                <ChevronsUpDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 border p-4 rounded-md">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FormField control={form.control} name="rohertrag" render={({ field }) => (
                                    <FormItem><LabelWithTooltip tooltipText="Rohertrag der Tour">Rohertrag</LabelWithTooltip>
                                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage />
                                    </FormItem> )} />
                                <FormField control={form.control} name="anSub" render={({ field }) => (
                                    <FormItem><LabelWithTooltip tooltipText="An Subunternehmer">an Sub</LabelWithTooltip>
                                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage />
                                    </FormItem> )} />
                                <FormField control={form.control} name="km" render={({ field }) => (
                                    <FormItem><LabelWithTooltip tooltipText="Gefahrene Kilometer">Km</LabelWithTooltip>
                                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage />
                                    </FormItem> )} />
                                <FormField control={form.control} name="df" render={({ field }) => (
                                    <FormItem><LabelWithTooltip tooltipText="Dieselfloater in Prozent">DF (%)</LabelWithTooltip>
                                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage />
                                    </FormItem> )} />
                                <FormField control={form.control} name="maut" render={({ field }) => (
                                    <FormItem><LabelWithTooltip tooltipText="Mautkosten (Standard 12,5%)">Maut (12,5%)</LabelWithTooltip>
                                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage />
                                    </FormItem> )} />
                                
                                {/* Calculated fields */}
                                <div className="space-y-1"><LabelWithTooltip tooltipText="Rohertrag + DF">Rohertrag + DF</LabelWithTooltip><p className="font-mono p-2 bg-muted rounded-md text-sm">{rohertragPlusDf.toFixed(2)} €</p></div>
                                <div className="space-y-1"><LabelWithTooltip tooltipText="Brutto (inkl. 19% MwSt.)">Brutto</LabelWithTooltip><p className="font-mono p-2 bg-muted rounded-md text-sm">{brutto.toFixed(2)} €</p></div>
                                <div className="space-y-1"><LabelWithTooltip tooltipText="Netto Euro pro Kilometer">€/km netto</LabelWithTooltip><p className="font-mono p-2 bg-muted rounded-md text-sm">{euroPerKm.toFixed(2)} €</p></div>

                                <FormField control={form.control} name="rechnungsnummer" render={({ field }) => (
                                    <FormItem><LabelWithTooltip tooltipText="Rechnungsnummer">Rechnungsnummer</LabelWithTooltip>
                                        <FormControl><Input placeholder="RE-2024-..." {...field} /></FormControl><FormMessage />
                                    </FormItem> )} />
                                <FormField
                                    control={form.control}
                                    name="bezahldatum"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col pt-2">
                                        <LabelWithTooltip tooltipText="Datum der Bezahlung">Bezahldatum</LabelWithTooltip>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}>
                                                {field.value ? ( format(field.value, "PPP") ) : ( <span>Datum wählen</span> )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="rechnungRaus" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 h-fit mt-auto">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="space-y-1 leading-none"><FormLabel>Rech. Raus</FormLabel></div>
                                    </FormItem>)} />
                                <FormField control={form.control} name="bezahlt" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 h-fit mt-auto">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="space-y-1 leading-none"><FormLabel>Bezahlt</FormLabel></div>
                                    </FormItem> )} />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
          </ScrollArea>
          
          <DialogFooter className="pt-4 pr-4">
            <DialogClose asChild>
                <Button type="button" variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button type="submit">Tour erstellen</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
