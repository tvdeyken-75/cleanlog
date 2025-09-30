
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
import type { ExpenseType, Photo } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

import { LocationInput } from './LocationInput';
import { ArrowLeft, Truck, CalendarClock, ChevronsUpDown, Euro, FileText, Camera, MapPin, CircleCheck, Trash2, File, Upload } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

const expenseTypes: { value: ExpenseType, label: string }[] = [
    { value: 'parking', label: 'Parkgebühren' },
    { value: 'toll', label: 'Mautgebühren' },
    { value: 'ferry', label: 'Fährkosten' },
    { value: 'other', label: 'Sonstiges' },
];

const photoSchema = z.object({
  dataUrl: z.string(),
  mimeType: z.string(),
});

const expenseProtocolSchema = z.object({
  expense_type: z.enum(['parking', 'toll', 'ferry', 'other'], { required_error: "Spesentyp ist ein Pflichtfeld." }),
  amount: z.coerce.number().positive("Betrag muss eine positive Zahl sein."),
  location: z.string().min(1, "Ort ist ein Pflichtfeld."),
  description: z.string().optional(),
  photos: z.array(photoSchema).optional(),
}).superRefine((data, ctx) => {
    if (data.expense_type === 'other' && !data.description) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Bei 'Sonstiges' ist eine Beschreibung erforderlich.",
            path: ['description'],
        });
    }
});


type ExpenseProtocolFormValues = z.infer<typeof expenseProtocolSchema>;

export function ExpenseProtocolForm() {
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

  const form = useForm<ExpenseProtocolFormValues>({
    resolver: zodResolver(expenseProtocolSchema),
    defaultValues: {
      location: '',
      photos: [],
      expense_type: undefined,
      amount: undefined,
      description: '',
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


  const onSubmit = (data: ExpenseProtocolFormValues) => {
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
    }, 'expense');

    toast({
      title: "Protokoll gespeichert",
      description: "Ihr Spesenprotokoll wurde erfolgreich hinzugefügt.",
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
          <h1 className="text-2xl font-bold font-headline">Neues Spesenprotokoll</h1>
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
          <CardHeader><CardTitle className="flex items-center gap-2"><Euro className="text-primary"/>Spesen-Details</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="expense_type" render={({ field }) => (
                <FormItem><LabelWithTooltip tooltipText="Тип расходов">Spesentyp</LabelWithTooltip>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wählen Sie den Spesentyp" /></SelectTrigger></FormControl>
                    <SelectContent>{expenseTypes.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><LabelWithTooltip tooltipText="Сумма в евро">Betrag</LabelWithTooltip>
                     <div className="relative">
                        <FormControl><Input type="number" step="0.01" {...field} placeholder="z.B. 25,50" className="pr-8"/></FormControl>
                        <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">€</span>
                     </div>
                    <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem className="md:col-span-2"><LabelWithTooltip tooltipText="Место возникновения расходов" className="flex items-center gap-2"><MapPin className="h-4 w-4"/>Ort der Ausgabe</LabelWithTooltip>
                    <FormControl><LocationInput value={field.value} onChange={field.onChange} /></FormControl><FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2"><LabelWithTooltip tooltipText="Краткое описание (обязательно для 'Прочее')" className="flex items-center gap-2"><FileText className="h-4 w-4"/>Beschreibung</LabelWithTooltip>
                    <FormControl><Textarea {...field} placeholder="Beschreiben Sie die Ausgabe..." rows={3} /></FormControl><FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="text-primary"/>Belegdokumentation (optional)</CardTitle></CardHeader>
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
                                    <Image src={photo.dataUrl} alt={`Beleg ${index + 1}`} width={200} height={150} className="rounded-md object-cover aspect-video"/>
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
            {form.formState.isSubmitting ? "Wird gespeichert..." : "Spesenprotokoll senden"}
            <CircleCheck className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      </form>
    </Form>
  );
}
