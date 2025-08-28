
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/context/AuthContext';
import { useProtocols } from '@/hooks/useProtocols';
import { useToast } from '@/hooks/use-toast';
import type { Photo as DocumentPhoto } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"


import { LocationInput } from './LocationInput';
import { ArrowLeft, Truck, CalendarClock, ChevronsUpDown, Wrench, FileText, Camera, MapPin, CircleCheck, Trash2, File, Upload, Timer, Gauge } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

const documentSchema = z.object({
  dataUrl: z.string(),
  mimeType: z.string(),
});

const maintenanceProtocolSchema = z.object({
  maintenance_type: z.enum(['Eigenleistung', 'Werkstatt'], { required_error: "Art der Durchführung ist ein Pflichtfeld." }),
  reason: z.string().min(5, "Grund muss mindestens 5 Zeichen lang sein."),
  description: z.string().min(10, "Beschreibung muss mindestens 10 Zeichen lang sein."),
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  duration: z.coerce.number().positive("Dauer muss eine positive Zahl sein."),
  odometer_reading: z.coerce.number().optional(),
  documents: z.array(documentSchema).optional(),
});

type MaintenanceProtocolFormValues = z.infer<typeof maintenanceProtocolSchema>;

export function MaintenanceProtocolForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { addProtocol } = useProtocols(user);
  const { toast } = useToast();
  
  const [currentTime, setCurrentTime] = useState("");
  const [isVehicleInfoOpen, setIsVehicleInfoOpen] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [documents, setDocuments] = useState<DocumentPhoto[]>([]);

  const truckLicensePlate = searchParams.get('truck');
  const trailerLicensePlate = searchParams.get('trailer');

  const form = useForm<MaintenanceProtocolFormValues>({
    resolver: zodResolver(maintenanceProtocolSchema),
    defaultValues: {
      location: '',
      documents: [],
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
    if (!authLoading && (!truckLicensePlate && !trailerLicensePlate)) {
        toast({ variant: 'destructive', title: "Kein Fahrzeug ausgewählt", description: "Bitte gehen Sie zurück und wählen Sie ein Fahrzeug für die Wartung aus."})
        router.replace('/tour-selection');
    }
  }, [authLoading, isAuthenticated, router, truckLicensePlate, trailerLicensePlate, toast]);
  
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
            const newDocs: DocumentPhoto[] = [...documents, { dataUrl, mimeType: 'image/jpeg' }];
            setDocuments(newDocs);
            form.setValue('documents', newDocs, { shouldValidate: true });
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
            const newDocs: DocumentPhoto[] = [...documents, { dataUrl, mimeType: file.type }];
            setDocuments(newDocs);
            form.setValue('documents', newDocs, { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index);
    setDocuments(newDocs);
    form.setValue('documents', newDocs, { shouldValidate: true });
  }


  const onSubmit = (data: MaintenanceProtocolFormValues) => {
    addProtocol({
        ...data,
        truck_license_plate: truckLicensePlate || undefined,
        trailer_license_plate: trailerLicensePlate || undefined,
    }, 'maintenance');

    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Wartungsprotokoll wurde erfolgreich hinzugefügt.",
    });
    router.push('/');
  };
  
  if (authLoading || !isAuthenticated || (!truckLicensePlate && !trailerLicensePlate)) {
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
          <h1 className="text-2xl font-bold font-headline">Neues Wartungs-/Reparaturprotokoll</h1>
        </div>
        
        <Collapsible open={isVehicleInfoOpen} onOpenChange={setIsVehicleInfoOpen}>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Truck className="text-primary"/>Fahrzeuginformationen</CardTitle>
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
                        {truckLicensePlate && (
                            <div><p className="text-muted-foreground">LKW</p><p className="font-medium">{truckLicensePlate}</p></div>
                        )}
                        {trailerLicensePlate && (
                            <div><p className="text-muted-foreground">Anhänger</p><p className="font-medium">{trailerLicensePlate}</p></div>
                        )}
                        <div><p className="text-muted-foreground flex items-center gap-1.5"><CalendarClock className="h-4 w-4"/>Datum & Zeit</p><p className="font-medium">{currentTime || "..."}</p></div>
                    </div>
                </CardContent>
              </CollapsibleContent>
          </Card>
        </Collapsible>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="text-primary"/>Wartungsdetails</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="maintenance_type" render={({ field }) => (
                <FormItem><LabelWithTooltip tooltipText="Кто выполняет работы">Art der Durchführung</LabelWithTooltip>
                    <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Eigenleistung" /></FormControl><LabelWithTooltip tooltipText="Своими силами" className="font-normal">Eigenleistung</LabelWithTooltip></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Werkstatt" /></FormControl><LabelWithTooltip tooltipText="Мастерская" className="font-normal">Werkstatt</LabelWithTooltip></FormItem>
                    </RadioGroup></FormControl><FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="reason" render={({ field }) => (
                <FormItem><LabelWithTooltip tooltipText="Причина обслуживания/ремонта">Grund für Wartung/Reparatur</LabelWithTooltip>
                    <FormControl><Input {...field} placeholder="z.B. Regelmäßige Wartung, Bremsbeläge" /></FormControl><FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2"><LabelWithTooltip tooltipText="Описание выполненных работ" className="flex items-center gap-2"><FileText className="h-4 w-4"/>Beschreibung der Korrekturmaßnahme</LabelWithTooltip>
                    <FormControl><Textarea {...field} placeholder="Beschreiben Sie die durchgeführten Arbeiten..." rows={4} /></FormControl><FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><LabelWithTooltip tooltipText="Место проведения работ" className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort</LabelWithTooltip>
                    <FormControl><LocationInput value={field.value} onChange={field.onChange} /></FormControl><FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Продолжительность работ" className="flex items-center gap-2"><Timer className="h-4 w-4" />Dauer</LabelWithTooltip>
                  <div className="relative">
                    <FormControl><Input type="number" {...field} placeholder="z.B. 120" className="pr-12"/></FormControl>
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">Minuten</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {truckLicensePlate && (
                 <FormField
                  control={form.control}
                  name="odometer_reading"
                  render={({ field }) => (
                    <FormItem>
                      <LabelWithTooltip tooltipText="Показания одометра (если применимо)" className="flex items-center gap-2"><Gauge className="h-4 w-4"/>Kilometerstand (falls LKW)</LabelWithTooltip>
                      <div className="relative">
                        <FormControl><Input type="number" {...field} placeholder="z.B. 123456" className="pr-8"/></FormControl>
                        <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">km</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="text-primary"/>Foto- & Dokumentendokumentation</CardTitle></CardHeader>
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
            <FormField control={form.control} name="documents" render={({ field }) => (
                <FormItem>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {documents.map((doc, index) => (
                            <div key={index} className="relative group">
                                {doc.mimeType.startsWith('image/') ? (
                                    <Image src={doc.dataUrl} alt={`Dokument ${index + 1}`} width={200} height={150} className="rounded-md object-cover aspect-video"/>
                                ) : (
                                    <div className="w-full aspect-video bg-muted rounded-md flex flex-col items-center justify-center p-2">
                                        <File className="h-10 w-10 text-muted-foreground"/>
                                        <p className="text-xs text-center text-muted-foreground mt-1 truncate">Dokument</p>
                                    </div>
                                )}
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => removeDocument(index)}>
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
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Wartungsprotokoll abschließen"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}
