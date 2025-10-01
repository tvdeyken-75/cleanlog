
"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useProtocols } from "@/hooks/useProtocols";
import { useToast } from "@/hooks/use-toast";

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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LabelWithTooltip } from "../ui/label-with-tooltip";
import { Truck, User as UserIcon, Building, Briefcase, FileText, MessageSquare, Ticket } from 'lucide-react';


const tourSchema = z.object({
  tourNr: z.string().min(1, "Tournummer ist ein Pflichtfeld."),
  driver: z.string().min(1, "Fahrer ist ein Pflichtfeld."),
  truck: z.string().min(1, "LKW ist ein Pflichtfeld."),
  trailer: z.string().min(1, "Auflieger ist ein Pflichtfeld."),
  customer: z.string().min(1, "Kunde ist ein Pflichtfeld."),
  description: z.string().optional(),
  remarks: z.string().optional(),
  customerRef: z.string().optional(),
});

type TourFormValues = z.infer<typeof tourSchema>;

interface CreateTourModalProps {
    onTourCreated: () => void;
}

export function CreateTourModal({ onTourCreated }: CreateTourModalProps) {
  const { toast } = useToast();
  const { getUsers, user } = useAuth();
  const { vehicles } = useProtocols(user);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      tourNr: "",
      driver: "",
      truck: "",
      trailer: "",
      customer: "",
      description: "",
      remarks: "",
      customerRef: "",
    },
  });

  const drivers = getUsers().filter(u => u.role.includes("driver"));
  const trucks = vehicles.truck.filter(v => v.active);
  const trailers = vehicles.trailer.filter(v => v.active);

  function onSubmit(data: TourFormValues) {
    // Here you would typically handle the form submission,
    // e.g., save the new tour to your state or backend.
    console.log(data);
    toast({
      title: "Tour erstellt",
      description: `Die Tour ${data.tourNr} wurde erfolgreich geplant.`,
    });
    onTourCreated();
    form.reset();
  }

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Neue Tour erstellen</DialogTitle>
        <DialogDescription>
          Füllen Sie die Details aus, um eine neue Tour zu planen.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField
                control={form.control}
                name="tourNr"
                render={({ field }) => (
                <FormItem>
                    <LabelWithTooltip tooltipText="Eindeutige Nummer der Tour" className="flex items-center gap-2"><Ticket className="w-4 h-4" />Tour-Nr.</LabelWithTooltip>
                    <FormControl>
                        <Input placeholder="z.B. 2024-001" {...field} />
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
                name="description"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
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
                <FormItem className="md:col-span-2">
                    <LabelWithTooltip tooltipText="Interne Bemerkungen zur Tour" className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Bemerkungen</fLabelWithTooltip>
                    <FormControl>
                        <Textarea placeholder="Besonderheiten oder Anweisungen" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          <DialogFooter className="md:col-span-2">
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
