
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
import type { GoodsType } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';

import { LocationInput } from './LocationInput';
import { ArrowLeft, Truck, Thermometer, MapPin, CircleCheck, Lock, Award, PackagePlus, Gauge, Timer, CalendarClock, ChevronsUpDown, Layers, Box } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

const loadingProtocolFormSchema = z.object({
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  duration: z.coerce.number().positive("Dauer muss eine positive Zahl sein."),
  odometer_reading: z.coerce.number().positive("Kilometerstand muss eine positive Zahl sein."),
  goods_type: z.enum(['food', 'non-food', 'empties'], { required_error: "Warenart ist ein Pflichtfeld." }),
  required_temperature: z.coerce.number(),
  articles: z.string().optional(),
  articles_other: z.string().optional(),
  quantity: z.coerce.number().optional(),
  packaging: z.string().optional(),
  weight: z.coerce.number().optional(),
  pallets: z.coerce.number().optional(),
  crates: z.coerce.number().optional(),
  cargo_area_temperature: z.coerce.number(),
  cargo_area_closed: z.boolean().default(false),
  has_seal: z.boolean().default(false),
}).superRefine((data, ctx) => {
    if (data.goods_type === 'food' || data.goods_type === 'non-food') {
        if (!data.articles) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Artikel ist ein Pflichtfeld.", path: ['articles'] });
        }
        if (data.articles === 'sonstiges' && !data.articles_other) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bitte beschreiben Sie die sonstigen Artikel.", path: ['articles_other'] });
        }
    }
    if (data.goods_type === 'empties') {
        if (!data.pallets) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Palettenanzahl ist ein Pflichtfeld.", path: ['pallets'] });
        if (!data.crates) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Kistenanzahl ist ein Pflichtfeld.", path: ['crates'] });
    }
});

type LoadingProtocolFormValues = z.infer<typeof loadingProtocolFormSchema>;

const articleOptions = {
    food: [
        { value: 'frisches-fleisch', label: 'Frisches Fleisch' },
        { value: 'halbe-schweine', label: 'Halbe Schweine' },
        { value: 'obst', label: 'Obst' },
        { value: 'gemuese', label: 'Gemüse' },
        { value: 'fleisch-in-dose', label: 'Fleisch in Dose' },
        { value: 'sonstiges', label: 'Sonstiges' },
    ],
    'non-food': [
        { value: 'blumen', label: 'Blumen' },
        { value: 'sonstiges', label: 'Sonstiges' },
    ],
};


export function LoadingProtocolForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour } = useTour();
  const { addProtocol } = useProtocols(user);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState("");
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);
  
  const form = useForm<LoadingProtocolFormValues>({
    resolver: zodResolver(loadingProtocolFormSchema),
    defaultValues: {
      location: '',
      duration: undefined,
      odometer_reading: undefined,
      goods_type: undefined,
      required_temperature: undefined,
      articles: '',
      articles_other: '',
      quantity: undefined,
      packaging: '',
      weight: undefined,
      pallets: undefined,
      crates: undefined,
      cargo_area_temperature: undefined,
      cargo_area_closed: false,
      has_seal: false,
    }
  });

  const watchGoodsType = form.watch('goods_type');
  const watchArticles = form.watch('articles');

  useEffect(() => {
    form.setValue('articles', '');
  }, [watchGoodsType, form]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'medium' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const onSubmit = (data: LoadingProtocolFormValues) => {
    if (!activeTour) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Keine aktive Tour gefunden. Bitte starten Sie eine neue Tour.",
      });
      return;
    }
    
    addProtocol({
        ...data,
        articles: data.articles === 'sonstiges' ? data.articles_other : data.articles,
        truck_license_plate: activeTour.truck_license_plate,
        trailer_license_plate: activeTour.trailer_license_plate,
        transport_order: activeTour.transport_order,
    }, 'loading');

    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Ladeprotokoll wurde erfolgreich hinzugefügt.",
    });
    router.push('/');
  };
  
  if (authLoading || !isAuthenticated || !activeTour) {
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
          <h1 className="text-2xl font-bold font-headline">Neues Ladeprotokoll</h1>
        </div>
        
        <Collapsible open={isTourInfoOpen} onOpenChange={setIsTourInfoOpen}>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Truck className="text-primary"/>Tour-Informationen</CardTitle>
                  <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                          <ChevronsUpDown className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                      </Button>
                  </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">LKW</p>
                            <p className="font-medium">{activeTour.truck_license_plate}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Anhänger</p>
                            <p className="font-medium">{activeTour.trailer_license_plate}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Transportauftrag</p>
                            <p className="font-medium">{activeTour.transport_order}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground flex items-center gap-1.5"><CalendarClock className="h-4 w-4"/>Datum & Zeit</p>
                            <p className="font-medium">{currentTime || "..."}</p>
                        </div>
                    </div>
                </CardContent>
              </CollapsibleContent>
          </Card>
        </Collapsible>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PackagePlus className="text-primary"/>Ladedetails</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Место погрузки" className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort der Beladung</LabelWithTooltip>
                  <FormControl><LocationInput value={field.value} onChange={field.onChange} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Продолжительность погрузки" className="flex items-center gap-2"><Timer className="h-4 w-4" />Dauer der Beladung</LabelWithTooltip>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 60" className="pr-12"/></FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">Minuten</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="odometer_reading"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Показания одометра" className="flex items-center gap-2"><Gauge className="h-4 w-4"/>Kilometerstand</LabelWithTooltip>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 123456" className="pr-8"/></FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">km</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="required_temperature"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Требования к температуре" className="flex items-center gap-2"><Thermometer className="h-4 w-4"/>Temperaturanforderungen</LabelWithTooltip>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 5" className="pr-8"/></FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">°C</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Wareninformationen</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FormField
                control={form.control}
                name="goods_type"
                render={({ field }) => (
                <FormItem>
                    <LabelWithTooltip tooltipText="Тип товаров">Art der Ware</LabelWithTooltip>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Wählen Sie eine Art" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="food">Lebensmittel</SelectItem>
                          <SelectItem value="non-food">Non-Food</SelectItem>
                          <SelectItem value="empties">Leergut</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            {(watchGoodsType === 'food' || watchGoodsType === 'non-food') && (
                <div className='space-y-6 p-4 border rounded-md'>
                    <FormField
                        control={form.control}
                        name="articles"
                        render={({ field }) => (
                        <FormItem>
                            <LabelWithTooltip tooltipText="Артикул">Artikel</LabelWithTooltip>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Wählen Sie einen Artikel" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {(articleOptions[watchGoodsType] || []).map(option => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {watchArticles === 'sonstiges' && (
                         <FormField
                            control={form.control}
                            name="articles_other"
                            render={({ field }) => (
                            <FormItem>
                                <LabelWithTooltip tooltipText="Описание для 'прочее'">Beschreibung für sonstige Artikel</LabelWithTooltip>
                                <FormControl><Textarea {...field} placeholder="Welche Artikel werden geladen?" /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                            <FormItem>
                                <LabelWithTooltip tooltipText="Количество (штук)">Menge (Stück)</LabelWithTooltip>
                                <FormControl><Input type="number" {...field} placeholder="z.B. 100" /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="packaging"
                            render={({ field }) => (
                            <FormItem>
                                <LabelWithTooltip tooltipText="Форма упаковки">Verpackungsform</LabelWithTooltip>
                                <FormControl><Input {...field} placeholder="z.B. Karton, Kiste" /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                            <FormItem>
                                <LabelWithTooltip tooltipText="Вес">Gewicht</LabelWithTooltip>
                                <div className="relative">
                                    <FormControl><Input type="number" {...field} placeholder="z.B. 500" className="pr-8"/></FormControl>
                                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">kg</span>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </div>
            )}
             {watchGoodsType === 'empties' && (
                <div className='grid md:grid-cols-2 gap-6 p-4 border rounded-md'>
                    <FormField
                        control={form.control}
                        name="pallets"
                        render={({ field }) => (
                        <FormItem>
                            <LabelWithTooltip tooltipText="Количество поддонов" className="flex items-center gap-2"><Layers className='h-4 w-4' />Anzahl Paletten</LabelWithTooltip>
                            <FormControl><Input type="number" {...field} placeholder="z.B. 10" /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="crates"
                        render={({ field }) => (
                        <FormItem>
                            <LabelWithTooltip tooltipText="Количество ящиков" className="flex items-center gap-2"><Box className='h-4 w-4' />Anzahl Kisten</LabelWithTooltip>
                            <FormControl><Input type="number" {...field} placeholder="z.B. 200" /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            )}
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
                  <LabelWithTooltip tooltipText="Температура в грузовом отсеке" className="flex items-center gap-2"><Thermometer className="h-4 w-4"/>Temperatur des Laderaums</LabelWithTooltip>
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
                        <LabelWithTooltip htmlFor="cargo_area_closed" tooltipText="Грузовой отсек заперт" className="font-normal flex items-center gap-2">
                            <Lock className="h-4 w-4"/>
                            Laderaum abgeschlossen
                        </LabelWithTooltip>
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
                        <LabelWithTooltip htmlFor="has_seal" tooltipText="Пломба в наличии" className="font-normal flex items-center gap-2">
                            <Award className="h-4 w-4"/>
                            Siegel vorhanden
                        </LabelWithTooltip>
                    </FormItem>
                )}
                />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Ladeprotokoll abschließen"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}
