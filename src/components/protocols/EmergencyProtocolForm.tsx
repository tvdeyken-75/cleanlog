
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
import type { EmergencyType, Photo } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"


import { LocationInput } from './LocationInput';
import { ArrowLeft, Truck, CalendarClock, ChevronsUpDown, Siren, FileText, Camera, MapPin, CircleCheck, Trash2, File, Upload } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

const emergencyTypes: { value: EmergencyType, label: string }[] = [
    { value: 'vehicle-damage', label: 'Fahrzeugschaden' },
    { value: 'goods-blocked', label: 'Ware gesperrt' },
    { value: 'personal-injury', label: 'Personenschaden' },
    { value: 'delay', label: 'Verzögerung' },
    { value: 'break-in', label: 'Einbruch/Ziegelbruch' },
    { value: 'health-incident', label: 'Gesundheitsvorfall' },
    { value: 'breakdown', label: 'Panne' },
    { value: 'other', label: 'Sonstiger Vorfall' },
];

const photoSchema = z.object({
  dataUrl: z.string(),
  mimeType: z.string(),
});

const emergencyProtocolSchema = z.object({
  emergency_type: z.enum(['vehicle-damage', 'goods-blocked', 'personal-injury', 'delay', 'break-in', 'health-incident', 'breakdown', 'other'], { required_error: "Meldungstyp ist ein Pflichtfeld." }),
  description: z.string().min(10, "Beschreibung muss mindestens 10 Zeichen lang sein."),
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  photos: z.array(photoSchema).min(1, "Mindestens ein Foto oder Dokument ist erforderlich."),
  reference_number: z.string().optional(),
  incident_type_description: z.string().optional(),
  help_called: z.enum(['yes', 'no']).optional(),
  estimated_duration: z.coerce.number().optional(),
  vehicle_immobile: z.enum(['yes', 'no']).optional(),
});

type EmergencyProtocolFormValues = z.infer<typeof emergencyProtocolSchema>;

export function EmergencyProtocolForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { activeTour } = useTour();
  const { addProtocol } = useProtocols(user);
  const { toast } = useToast();
  
  const [currentTime, setCurrentTime] = useState("");
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const form = useForm<EmergencyProtocolFormValues>({
    resolver: zodResolver(emergencyProtocolSchema),
    defaultValues: {
      location: '',
      photos: [],
      emergency_type: undefined,
      description: '',
      reference_number: '',
      incident_type_description: '',
      help_called: undefined,
      estimated_duration: undefined,
      vehicle_immobile: undefined,
    }
  });

  const watchEmergencyType = form.watch('emergency_type');
  
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
        toast({
          variant: "destructive",
          title: "Kamerazugriff verweigert",
          description: "Bitte erlauben Sie den Kamerazugriff in Ihren Browsereinstellungen.",
        });
      }
    }
    getCameraPermission();
  }, [toast]);
  
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


  const onSubmit = (data: EmergencyProtocolFormValues) => {
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
        help_called: data.help_called === 'yes',
        vehicle_immobile: data.vehicle_immobile === 'yes',
    }, 'emergency');

    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Notfallprotokoll wurde erfolgreich hinzugefügt.",
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
          <h1 className="text-2xl font-bold font-headline text-destructive">Notfall-Protokoll</h1>
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
                        <div><p className="text-muted-foreground">LKW</p><p className="font-medium">{activeTour.truck_license_plate}</p></div>
                        <div><p className="text-muted-foreground">Anhänger</p><p className="font-medium">{activeTour.trailer_license_plate}</p></div>
                        <div><p className="text-muted-foreground">Transportauftrag</p><p className="font-medium">{activeTour.transport_order}</p></div>
                        <div><p className="text-muted-foreground flex items-center gap-1.5"><CalendarClock className="h-4 w-4"/>Datum & Zeit</p><p className="font-medium">{currentTime || "..."}</p></div>
                    </div>
                </CardContent>
              </CollapsibleContent>
          </Card>
        </Collapsible>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Siren className="text-primary"/>Notfall-Details</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="emergency_type" render={({ field }) => (
                <FormItem><LabelWithTooltip tooltipText="Тип происшествия">Meldungstyp</LabelWithTooltip>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie den Meldungstyp" /></SelectTrigger></FormControl>
                    <SelectContent>{emergencyTypes.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><LabelWithTooltip tooltipText="Место происшествия" className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort des Vorfalls</LabelWithTooltip>
                    <FormControl><LocationInput value={field.value} onChange={field.onChange} /></FormControl><FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2"><LabelWithTooltip tooltipText="Краткое описание происшествия" className="flex items-center gap-2"><FileText className="h-4 w-4"/>Kurzbeschreibung</LabelWithTooltip>
                    <FormControl><Textarea {...field} placeholder="Beschreiben Sie den Vorfall so detailliert wie möglich..." rows={4} /></FormControl><FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Conditional Fields */}
        {(watchEmergencyType === 'vehicle-damage' || watchEmergencyType === 'goods-blocked' || watchEmergencyType === 'break-in') && (
            <Card><CardHeader><CardTitle>Zusätzliche Informationen</CardTitle></CardHeader><CardContent>
                <FormField control={form.control} name="reference_number" render={({ field }) => (
                    <FormItem><LabelWithTooltip tooltipText="Номер накладной/пломбы">Lieferschein-/Siegel-Nr.</LabelWithTooltip>
                        <FormControl><Input {...field} placeholder="z.B. LS-12345 oder Siegel-Nr." /></FormControl><FormMessage />
                    </FormItem>
                )}/>
            </CardContent></Card>
        )}
        {(watchEmergencyType === 'personal-injury' || watchEmergencyType === 'health-incident') && (
            <Card><CardHeader><CardTitle>Informationen zu Personen</CardTitle></CardHeader><CardContent className="space-y-4">
                 <FormField control={form.control} name="incident_type_description" render={({ field }) => (
                    <FormItem><LabelWithTooltip tooltipText="Вид травмы/проблемы">Art des Schadens/Problems</LabelWithTooltip>
                        <FormControl><Input {...field} placeholder="z.B. Schnittwunde, Kreislaufprobleme" /></FormControl><FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="help_called" render={({ field }) => (
                    <FormItem><LabelWithTooltip tooltipText="Вызвана ли помощь?">Hilfe gerufen?</LabelWithTooltip>
                        <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><LabelWithTooltip tooltipText="Да" className="font-normal">Ja</LabelWithTooltip></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><LabelWithTooltip tooltipText="Нет" className="font-normal">Nein</LabelWithTooltip></FormItem>
                        </RadioGroup></FormControl><FormMessage />
                    </FormItem>
                )}/>
            </CardContent></Card>
        )}
        {(watchEmergencyType === 'delay' || watchEmergencyType === 'breakdown') && (
            <Card><CardHeader><CardTitle>Informationen zur Verzögerung</CardTitle></CardHeader><CardContent className="space-y-4">
                <FormField control={form.control} name="estimated_duration" render={({ field }) => (
                    <FormItem><LabelWithTooltip tooltipText="Предполагаемая продолжительность (в минутах)">Geschätzte Dauer (in Minuten)</LabelWithTooltip>
                        <FormControl><Input type="number" {...field} placeholder="z.B. 60" /></FormControl><FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="vehicle_immobile" render={({ field }) => (
                    <FormItem><LabelWithTooltip tooltipText="ТС не на ходу?">Fahrzeug fahruntüchtig?</LabelWithTooltip>
                        <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><LabelWithTooltip tooltipText="Да" className="font-normal">Ja</LabelWithTooltip></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><LabelWithTooltip tooltipText="Нет" className="font-normal">Nein</LabelWithTooltip></FormItem>
                        </RadioGroup></FormControl><FormMessage />
                    </FormItem>
                )}/>
            </CardContent></Card>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="text-primary"/>Foto- & Dokumentendokumentation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTitle>Kamerazugriff erforderlich</AlertTitle>
                    <AlertDescription>Bitte erlauben Sie den Zugriff auf die Kamera, um Fotos aufzunehmen. Möglicherweise müssen Sie die Seite neu laden.</AlertDescription>
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
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="bg-destructive hover:bg-destructive/90">
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Notfall-Protokoll senden"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}

    