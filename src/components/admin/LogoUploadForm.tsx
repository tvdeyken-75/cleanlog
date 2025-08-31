
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

const LOGO_STORAGE_KEY = 'fahrerLogbuchLogo_v1';

const logoSchema = z.object({
  logo: z.string().optional(),
});

type LogoFormValues = z.infer<typeof logoSchema>;

export function LogoUploadForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<LogoFormValues>({
    resolver: zodResolver(logoSchema),
    defaultValues: {
      logo: '',
    },
  });

  useEffect(() => {
    try {
      const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (storedLogo) {
        setLogoPreview(storedLogo);
        form.setValue('logo', storedLogo);
      }
    } catch (error) {
      console.error("Could not access localStorage for logo", error);
    }
  }, [form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/png') {
        toast({
            variant: "destructive",
            title: "Ungültiger Dateityp",
            description: "Bitte laden Sie eine PNG-Datei hoch.",
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setLogoPreview(dataUrl);
        form.setValue('logo', dataUrl, { shouldValidate: true });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const removeLogo = () => {
    setLogoPreview(null);
    form.setValue('logo', '');
  }

  const onSubmit = (data: LogoFormValues) => {
    try {
      if (data.logo) {
        localStorage.setItem(LOGO_STORAGE_KEY, data.logo);
      } else {
        localStorage.removeItem(LOGO_STORAGE_KEY);
      }
      toast({
        title: "Einstellungen gespeichert",
        description: "Das Firmenlogo wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error("Could not write logo to localStorage", error);
       toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: "Das Logo konnte nicht gespeichert werden.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Logo hochladen</CardTitle>
                <CardDescription>Laden Sie Ihr Firmenlogo als PNG-Datei hoch. Es wird auf den PDF-Berichten angezeigt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                    <FormItem>
                        <LabelWithTooltip tooltipText="Wählen Sie eine PNG-Datei">Logo-Datei</LabelWithTooltip>
                        <FormControl>
                            <>
                                <Input 
                                    type="file" 
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/png"
                                />
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Logo auswählen
                                </Button>
                            </>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                {logoPreview && (
                    <div className="space-y-2">
                        <LabelWithTooltip tooltipText="Vorschau des aktuellen Logos">Vorschau</LabelWithTooltip>
                        <div className="relative w-48 p-4 border rounded-md">
                             <Image src={logoPreview} alt="Logo Vorschau" width={192} height={100} style={{ objectFit: 'contain' }}/>
                             <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={removeLogo}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Logo speichern
        </Button>
      </form>
    </Form>
  );
}
