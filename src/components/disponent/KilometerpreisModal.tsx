

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LabelWithTooltip } from "../ui/label-with-tooltip";
import { Tour } from "@/lib/types";
import { DollarSign, Route } from "lucide-react";

const kmPreisSchema = z.object({
  rohertrag: z.coerce.number().min(0, "Rohertrag muss positiv sein."),
  km: z.coerce.number().positive("Kilometer müssen eine positive Zahl sein."),
});

type KmPreisFormValues = z.infer<typeof kmPreisSchema>;

interface KilometerpreisModalProps {
    tour: Partial<Tour>;
    onSave: (tourNr: string, newPreis: number) => void;
    onClose: () => void;
}

export function KilometerpreisModal({ tour, onSave, onClose }: KilometerpreisModalProps) {
  const form = useForm<KmPreisFormValues>({
    resolver: zodResolver(kmPreisSchema),
    defaultValues: {
      rohertrag: tour.rohertrag || 0,
      km: tour.km || 0,
    },
  });

  const rohertrag = form.watch("rohertrag");
  const km = form.watch("km");
  const kilometerpreis = km > 0 ? rohertrag / km : 0;

  useEffect(() => {
    form.reset({
        rohertrag: tour.rohertrag || 0,
        km: tour.km || 0,
    })
  }, [tour, form]);


  function onSubmit(data: KmPreisFormValues) {
    if (tour.tourNr) {
      onSave(tour.tourNr, kilometerpreis);
    }
    onClose();
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Kilometerpreis berechnen</DialogTitle>
        <DialogDescription>
          Geben Sie Rohertrag und Kilometer ein, um den Preis für Tour {tour.tourNr} zu berechnen.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="rohertrag"
                    render={({ field }) => (
                    <FormItem>
                        <LabelWithTooltip tooltipText="Gesamtertrag der Tour" className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4"/>Rohertrag
                        </LabelWithTooltip>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="km"
                    render={({ field }) => (
                    <FormItem>
                        <LabelWithTooltip tooltipText="Gesamtkilometer der Tour" className="flex items-center gap-2">
                           <Route className="w-4 h-4" /> Kilometer
                        </LabelWithTooltip>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="space-y-2">
                <LabelWithTooltip tooltipText="Berechneter Preis pro Kilometer">Kilometerpreis</LabelWithTooltip>
                <div className="p-2 bg-muted rounded-md text-lg font-bold text-center">
                    {kilometerpreis.toFixed(2)} €
                </div>
            </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            </DialogClose>
            <Button type="submit">Speichern</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
