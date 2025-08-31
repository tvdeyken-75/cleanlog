
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
import type { Photo } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"


import { LocationInput } from './LocationInput';
import { ArrowLeft, Sparkles, Truck, ClipboardList, Thermometer, Droplets, MapPin, AlertTriangle, CircleCheck, CalendarClock, ChevronsUpDown, Camera, Upload, Trash2, File, Gauge } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

const contaminationTypes = [
  { id: 'chemical', label: 'Chemisch (Reinigungsmittelrückstand)' },
  { id: 'biological', label: 'Biologisch (Biofilm, Schimmel)' },
  { id: 'rust', label: 'Rost' },
  { id: 'dirt', label: 'Sand/Erde' },
  { id: 'foreign', label: 'Fremdkörper' },
  { id: 'other', label: 'Sonstiges' },
];

const photoSchema = z.object({
  dataUrl: z.string(),
  mimeType: z.string(),
});

const protocolFormSchema = z.object({
  cleaning_type: z.string({ required_error: "Art der Reinigung ist ein Pflichtfeld." }),
  cleaning_products: z.string().min(1, "Reinigungsmittel ist ein Pflichtfeld."),
  control_type: z.string({ required_error: "Art der Kontrolle ist ein Pflichtfeld." }),
  control_result: z.enum(["i.O.", "n.i.O."], { required_error: "Ergebnis ist ein Pflichtfeld." }),
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  water_temperature: z.coerce.number({ invalid_type_error: "Temperatur muss eine Zahl sein." }).min(-50, "Temperatur zu niedrig").max(120, "Temperatur zu hoch"),
  water_quality: z.string({ required_error: "Wasserqualität ist ein Pflichtfeld." }),
  odometer_reading: z.coerce.number().positive("Kilometerstand muss eine positive Zahl sein."),
  photos: z.array(photoSchema).optional(),
  contamination_types: z.array(z.string()).optional(),
  contamination_description: z.string().optional(),
  corrective_actions: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.control_result === 'n.i.O.') {
    if (!data.contamination_types || data.contamination_types.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mindestens eine Art der Kontamination muss ausgewählt werden.", path: ['contamination_types'] });
    }
    if (!data.contamination_description?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Beschreibung der Kontamination ist ein Pflichtfeld.", path: ['contamination_description'] });
    }
    if (!data.corrective_actions?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Korrekturmaßnahmen sind ein Pflichtfeld.", path: ['corrective_actions'] });
    }
  }
});

type ProtocolFormValues = z.infer<typeof protocolFormSchema>;

export function ProtocolForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour } = useTour();
  const { addProtocol } = useProtocols(user);
  const { toast } = useToast();
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [currentTime, setCurrentTime] = useState("");
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const form = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolFormSchema),
    defaultValues: {
      location: '',
      cleaning_type: undefined,
      cleaning_products: '',
      control_type: undefined,
      control_result: undefined,
      water_temperature: 0,
      water_quality: undefined,
      odometer_reading: undefined,
      photos: [],
      contamination_types: [],
      contamination_description: '',
      corrective_actions: '',
    }
  });

  const watchControlResult = form.watch('control_result');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'medium' }));
    }, 1000);
    setStartTime(new Date().toISOString()); // Keep start time for saving
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

  const onSubmit = (data: ProtocolFormValues) => {
    if (!activeTour) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Keine aktive Tour gefunden. Bitte starten Sie eine neue Tour.",
      });
      return;
    }

    const protocolData = {
        ...data,
      truck_license_plate: activeTour.truck_license_plate,
      trailer_license_plate: activeTour.trailer_license_plate,
      transport_order: activeTour.transport_order,
      start_time: startTime,
      contamination_details: data.control_result === 'n.i.O.' ? {
        types: data.contamination_types || [],
        description: data.contamination_description || '',
        corrective_actions: data.corrective_actions || '',
      } : undefined,
    };
    addProtocol(protocolData, 'cleaning');
    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Reinigungsprotokoll wurde erfolgreich hinzugefügt.",
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
          <h1 className="text-2xl font-bold font-headline">Neues Reinigungsprotokoll</h1>
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
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>Reinigungsdetails</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="cleaning_type"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Вид уборки">Art der Reinigung</LabelWithTooltip>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Wählen Sie eine Art" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tägliche Reinigung">Tägliche Reinigung</SelectItem>
                      <SelectItem value="Grundreinigung">Grundreinigung</SelectItem>
                      <SelectItem value="Desinfektion nach Ladungsart">Desinfektion nach Ladungsart</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cleaning_products"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Используемые чистящие/дезинфицирующие средства">Verwendete Reinigungs-/Desinfektionsmittel</LabelWithTooltip>
                  <FormControl><Input {...field} placeholder="z.B. Desinfekto-123" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="text-primary"/>Qualitätskontrolle</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="control_type"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Вид контроля">Art der Kontrolle</LabelWithTooltip>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie eine Art" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Visuell">Visuell</SelectItem>
                      <SelectItem value="Abklatschprobe">Abklatschprobe</SelectItem>
                      <SelectItem value="ATP-Messung">ATP-Messung</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="control_result"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Результат контроля">Ergebnis der Kontrolle</LabelWithTooltip>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie ein Ergebnis" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="i.O.">i.O. (in Ordnung)</SelectItem>
                      <SelectItem value="n.i.O.">n.i.O. (nicht in Ordnung)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 space-y-4">
              <LabelWithTooltip tooltipText="Документация с фотографиями">Fotodokumentation</LabelWithTooltip>
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
                      <Upload className="mr-2 h-5 w-5"/> Datei hochladen
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
            </div>
          </CardContent>
        </Card>

        {watchControlResult === 'n.i.O.' && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/>Meldung Kontamination</CardTitle>
              <CardDescription>Dieses Feld ist bei einem "n.i.O."-Ergebnis auszufüllen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="contamination_types"
                  render={() => (
                    <FormItem>
                      <LabelWithTooltip tooltipText="Вид загрязнения">Art der Kontamination</LabelWithTooltip>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {contaminationTypes.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="contamination_types"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(field.value?.filter((value) => value !== item.id));
                                      }}
                                    />
                                  </FormControl>
                                  <LabelWithTooltip tooltipText="Вид загрязнения" className="font-normal">{item.label}</LabelWithTooltip>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="contamination_description"
                render={({ field }) => (
                  <FormItem>
                    <LabelWithTooltip tooltipText="Описание выявленного загрязнения">Beschreibung der festgestellten Kontamination</LabelWithTooltip>
                    <FormControl><Textarea {...field} placeholder="Beschreiben Sie die Kontamination im Detail..."/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="corrective_actions"
                render={({ field }) => (
                  <FormItem>
                    <LabelWithTooltip tooltipText="Проведенные корректирующие мероприятия">Durchgeführte Korrekturmaßnahmen</LabelWithTooltip>
                    <FormControl><Textarea {...field} placeholder="z.B. Erneute Reinigung durchgeführt, Werkstatt gemeldet..."/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="text-primary"/>Umgebungsdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <LabelWithTooltip tooltipText="Место" className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort</LabelWithTooltip>
                      <FormControl><LocationInput value={field.value} onChange={field.onChange} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="water_temperature"
                  render={({ field }) => (
                    <FormItem>
                      <LabelWithTooltip tooltipText="Температура воды" className="flex items-center gap-2"><Thermometer className="h-4 w-4"/>Wassertemperatur</LabelWithTooltip>
                      <div className="relative">
                        <FormControl><Input type="number" {...field} placeholder="z.B. 45" className="pr-8"/></FormControl>
                        <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">°C</span>
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
            </div>
            <FormField
              control={form.control}
              name="water_quality"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Качество воды" className="flex items-center gap-2"><Droplets className="h-4 w-4"/>Wasserqualität</LabelWithTooltip>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie eine Qualität" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Trinkwasserqualität">Trinkwasserqualität</SelectItem>
                      <SelectItem value="Betriebseigenes Wasser">Betriebseigenes Wasser</SelectItem>
                      <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Protokoll abschließen"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}

    

    
