
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/context/AuthContext';
import { useProtocols } from '@/hooks/useProtocols';
import { useToast } from '@/hooks/use-toast';
import { useTour } from '@/context/TourContext';
import type { LoadingProtocol, Photo } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

import { ArrowLeft, Truck, Thermometer, MapPin, CircleCheck, Lock, Award, PackageCheck, MessageSquare, Timer, CalendarClock, ChevronsUpDown, PackageSearch, Camera, Trash2, File, Upload, Gauge } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';


const photoSchema = z.object({
  dataUrl: z.string(),
  mimeType: z.string(),
});

const deliveryProtocolFormSchema = z.object({
  loading_protocol_number: z.string({ required_error: "Ladeprotokoll ist ein Pflichtfeld." }),
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  unloading_duration: z.coerce.number().positive("Dauer muss eine positive Zahl sein."),
  odometer_reading: z.coerce.number().positive("Kilometerstand muss eine positive Zahl sein."),
  message: z.string().optional(),
  cargo_area_temperature: z.coerce.number(),
  cargo_area_closed: z.boolean().default(false),
  has_seal: z.boolean().default(false),
  photos: z.array(photoSchema).optional(),
});

type DeliveryProtocolFormValues = z.infer<typeof deliveryProtocolFormSchema>;

export function DeliveryProtocolForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour } = useTour();
  const { protocols, addProtocol } = useProtocols(user);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState("");
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const form = useForm<DeliveryProtocolFormValues>({
    resolver: zodResolver(deliveryProtocolFormSchema),
    defaultValues: {
      location: '',
      loading_protocol_number: undefined,
      unloading_duration: 0,
      odometer_reading: undefined,
      message: '',
      cargo_area_temperature: 0,
      cargo_area_closed: false,
      has_seal: false,
      photos: [],
    }
  });

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

  useEffect(() => {
    async function getCameraPermission() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (err) {
        setHasCameraPermission(false);
      }
    }
    getCameraPermission();
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            const newPhotos: Photo[] = [...photos, { dataUrl, mimeType: 'image/jpeg' }];
            setPhotos(newPhotos);
            form.setValue('photos', newPhotos, { shouldValidate: true });
        }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
            const newPhotos: Photo[] = [...photos, { dataUrl, mimeType: file.type }];
            setPhotos(newPhotos);
            form.setValue('photos', newPhotos, { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    form.setValue('photos', newPhotos, { shouldValidate: true });
  }


  const onSubmit = (data: DeliveryProtocolFormValues) => {
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
        truck_license_plate: activeTour.truck_license_plate,
        trailer_license_plate: activeTour.trailer_license_plate,
        transport_order: activeTour.transport_order,
        message: data.message || "",
    }, 'delivery');

    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Lieferprotokoll wurde erfolgreich hinzugefügt.",
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

  const loadingProtocolsForTour = protocols.filter(p => p.type === 'loading' && p.transport_order === activeTour.transport_order) as LoadingProtocol[];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold font-headline">Neues Lieferprotokoll</h1>
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
            <CardTitle className="flex items-center gap-2"><PackageCheck className="text-primary"/>Lieferdetails</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="loading_protocol_number"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Соответствующий протокол погрузки" className="flex items-center gap-2"><PackageSearch className="h-4 w-4" />Zugehöriges Ladeprotokoll</LabelWithTooltip>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie das Ladeprotokoll" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {loadingProtocolsForTour.length > 0 ? (
                            loadingProtocolsForTour.map(p => (
                                <SelectItem key={p.id} value={p.loading_protocol_number}>
                                    {p.loading_protocol_number} ({p.articles || p.goods_type})
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="none" disabled>Keine Ladeprotokolle für diese Tour</SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <LabelWithTooltip tooltipText="Место доставки" className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort der Lieferung</LabelWithTooltip>
                    <FormControl><Input placeholder="z.B. Musterstraße 1, 12345 Musterstadt" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="unloading_duration"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Продолжительность разгрузки" className="flex items-center gap-2"><Timer className="h-4 w-4" />Dauer der Entladung</LabelWithTooltip>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 30" className="pr-12"/></FormControl>
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
                name="message"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <LabelWithTooltip tooltipText="Сообщение / Примечание (необязательно)" className="flex items-center gap-2"><MessageSquare className="h-4 w-4"/>Meldung / Anmerkung (optional)</LabelWithTooltip>
                    <FormControl><Textarea {...field} placeholder="Besondere Vorkommnisse bei der Lieferung..." /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
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
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="text-primary"/>Fotodokumentation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTitle>Kamerazugriff erforderlich</AlertTitle>
                    <AlertDescription>Bitte erlauben Sie den Zugriff auf die Kamera, um Fotos aufzunehmen.</AlertDescription>
                </Alert>
             )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="w-full aspect-video bg-muted rounded-md overflow-hidden relative md:col-span-2">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex flex-col gap-2">
                <Button type="button" onClick={takePhoto} disabled={!hasCameraPermission} size="lg">
                    <Camera className="mr-2 h-5 w-5"/> Foto aufnehmen
                </Button>
                <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" size="lg">
                    <Upload className="mr-2 h-5 w-5"/> Dokument hochladen
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,application/pdf"
                    multiple
                />
              </div>
            </div>
            <FormField control={form.control} name="photos" render={({ field }) => (
                <FormItem>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative group">
                                {photo.mimeType.startsWith('image/') ? (
                                    <Image src={photo.dataUrl} alt={`Dokument ${index + 1}`} width={200} height={150} className="rounded-md object-cover aspect-video"/>
                                ) : (
                                    <div className="w-full aspect-video bg-muted rounded-md flex flex-col items-center justify-center p-2">
                                        <File className="h-10 w-10 text-muted-foreground"/>
                                        <p className="text-xs text-center text-muted-foreground mt-1 truncate">Dokument</p>
                                    </div>
                                )}
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => removePhoto(index)}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                    <FormMessage />
                </FormItem>
            )} />
          </CardContent>
        </Card>


        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Lieferprotokoll abschließen"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}

    