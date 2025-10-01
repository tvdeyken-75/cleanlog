
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Mail, MessageSquare, Globe } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';

const NOTIFICATION_SETTINGS_STORAGE_KEY = 'fahrerchecklisteNotificationSettings_v1';

const notificationSettingsSchema = z.object({
  emails: z.string().optional(),
  whatsapp: z.string().optional(),
  apiUri: z.string().url("Bitte geben Sie eine gültige URL ein.").optional().or(z.literal('')),
});

type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

export function NotificationSettingsForm() {
  const { toast } = useToast();

  const form = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emails: '',
      whatsapp: '',
      apiUri: '',
    },
  });

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        form.reset(parsedSettings);
      }
    } catch (error) {
      console.error("Could not access localStorage for notification settings", error);
    }
  }, [form]);

  const onSubmit = (data: NotificationSettingsFormValues) => {
    try {
      localStorage.setItem(NOTIFICATION_SETTINGS_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Benachrichtigungseinstellungen wurden erfolgreich aktualisiert.",
      });
    } catch(error) {
        console.error("Could not write notification settings to localStorage", error);
        toast({
            variant: "destructive",
            title: "Fehler beim Speichern",
            description: "Die Benachrichtigungseinstellungen konnten nicht gespeichert werden.",
        });
    }
  };

  return (
    <div className='space-y-6'>
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>Empfänger konfigurieren</CardTitle>
                <CardDescription>Geben Sie an, wohin die Tour-Zusammenfassungen gesendet werden sollen.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="emails"
                    render={({ field }) => (
                        <FormItem>
                        <LabelWithTooltip tooltipText="Eine oder mehrere E-Mail-Adressen, durch Kommas getrennt">
                            <div className='flex items-center gap-2'><Mail className="h-4 w-4" /> E-Mail-Adressen</div>
                        </LabelWithTooltip>
                        <FormControl>
                            <Textarea {...field} placeholder="z.B. chef@firma.de, buero@firma.de" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                        <FormItem>
                        <LabelWithTooltip tooltipText="WhatsApp-Nummer für Benachrichtigungen">
                             <div className='flex items-center gap-2'><MessageSquare className="h-4 w-4" /> WhatsApp-Konto</div>
                        </LabelWithTooltip>
                        <FormControl>
                            <Input {...field} placeholder="z.B. +49123456789" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="apiUri"
                    render={({ field }) => (
                        <FormItem>
                        <LabelWithTooltip tooltipText="Die URL, an die die JSON-Zusammenfassung gesendet werden soll">
                             <div className='flex items-center gap-2'><Globe className="h-4 w-4" /> REST API URI</div>
                        </LabelWithTooltip>
                        <FormControl>
                            <Input {...field} placeholder="https://ihre-api.de/endpoint" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Einstellungen speichern
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
