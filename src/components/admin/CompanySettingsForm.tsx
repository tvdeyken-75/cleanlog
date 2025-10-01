
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
import { Save, Upload, Trash2, Building, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { Separator } from '../ui/separator';

const SETTINGS_STORAGE_KEY = 'fahrerchecklisteCompanySettings_v1';

const settingsSchema = z.object({
  logo: z.string().optional(),
  companyName: z.string().optional(),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  apiKey: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function CompanySettingsForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      logo: '',
      companyName: '',
      street: '',
      zip: '',
      city: '',
      country: '',
      apiKey: '',
    },
  });

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        form.reset(parsedSettings);
        if (parsedSettings.logo) {
          setLogoPreview(parsedSettings.logo);
        }
      }
    } catch (error) {
      console.error("Could not access localStorage for settings", error);
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
    form.setValue('logo', undefined, { shouldDirty: true });
  }

  const onSubmit = (data: SettingsFormValues) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Stammdaten wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error("Could not write settings to localStorage", error);
       toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: "Die Stammdaten konnten nicht gespeichert werden.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building />Firmendaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                      <FormItem>
                          <LabelWithTooltip tooltipText="Der Name Ihres Unternehmens">Firmenname</LabelWithTooltip>
                          <FormControl>
                              <Input placeholder="z.B. Mustermann GmbH" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                      <FormItem>
                          <LabelWithTooltip tooltipText="Straße und Hausnummer">Straße</LabelWithTooltip>
                          <FormControl>
                              <Input placeholder="Musterstraße 1" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                />
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                   <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                        <FormItem>
                            <LabelWithTooltip tooltipText="Postleitzahl">PLZ</LabelWithTooltip>
                            <FormControl>
                                <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem className='md:col-span-2'>
                            <LabelWithTooltip tooltipText="Ort">Ort</LabelWithTooltip>
                            <FormControl>
                                <Input placeholder="Musterstadt" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                      <FormItem>
                          <LabelWithTooltip tooltipText="Land">Land</LabelWithTooltip>
                          <FormControl>
                              <Input placeholder="Deutschland" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                />
                <Separator />
                <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                    <FormItem>
                        <LabelWithTooltip tooltipText="API-Schlüssel für externe Integrationen" className="flex items-center gap-2"><Key className="w-4 h-4" />API Key</LabelWithTooltip>
                        <FormControl>
                            <Input placeholder="Ihr API-Schlüssel" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
        </Card>
        
        <Separator />
        
        <Card>
            <CardHeader>
                <CardTitle>Firmenlogo</CardTitle>
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
                            <div>
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
                            </div>
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
          Stammdaten speichern
        </Button>
      </form>
    </Form>
  );
}
