
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

const sqliteSchema = z.object({
  dbType: z.literal('sqlite'),
  filePath: z.string().min(1, "Dateipfad ist ein Pflichtfeld."),
});

const remoteDbSchema = z.object({
  dbType: z.union([z.literal('postgresql'), z.literal('mariadb')]),
  serverAddress: z.string().min(1, "Serveradresse ist ein Pflichtfeld."),
  port: z.coerce.number().positive("Port muss eine positive Zahl sein."),
  username: z.string().min(1, "Benutzername ist ein Pflichtfeld."),
  password: z.string().optional(),
  databaseName: z.string().min(1, "Datenbankname ist ein Pflichtfeld."),
});

const dbSettingsSchema = z.discriminatedUnion("dbType", [
  sqliteSchema,
  remoteDbSchema,
]);

type DbSettingsFormValues = z.infer<typeof dbSettingsSchema>;

export function DatabaseSettingsForm() {
  const { toast } = useToast();

  const form = useForm<DbSettingsFormValues>({
    resolver: zodResolver(dbSettingsSchema),
    defaultValues: {
      dbType: 'sqlite',
      filePath: '',
    },
  });

  const onSubmit = (data: DbSettingsFormValues) => {
    console.log("Saving database settings:", data);
    // Here you would typically save the settings to a secure backend or config file.
    // For this prototype, we'll just show a toast.
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Datenbankverbindung wurde erfolgreich konfiguriert.",
    });
  };

  const dbType = form.watch('dbType');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="dbType"
          render={({ field }) => (
            <FormItem>
              <LabelWithTooltip tooltipText="Datenbanktyp auswählen">Datenbanktyp</LabelWithTooltip>
              <Select 
                onValueChange={(value) => {
                    field.onChange(value);
                    // Reset form values when changing DB type
                    if (value === 'sqlite') {
                        form.reset({ dbType: 'sqlite', filePath: '' });
                    } else {
                        form.reset({ dbType: value as 'postgresql' | 'mariadb', serverAddress: '', port: undefined, username: '', password: '', databaseName: '' });
                    }
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mariadb">MariaDB</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {dbType === 'sqlite' && (
          <FormField
            control={form.control}
            name="filePath"
            render={({ field }) => (
              <FormItem>
                <LabelWithTooltip tooltipText="Pfad zur SQLite-Datenbankdatei">Dateipfad</LabelWithTooltip>
                <FormControl>
                  <Input placeholder="/pfad/zur/datenbank.sqlite" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(dbType === 'postgresql' || dbType === 'mariadb') && (
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
            <FormField
              control={form.control}
              name="serverAddress"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Serveradresse oder IP">Serveradresse</LabelWithTooltip>
                  <FormControl>
                    <Input placeholder="localhost" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Port des Datenbankservers">Port</LabelWithTooltip>
                  <FormControl>
                    <Input type="number" placeholder={dbType === 'postgresql' ? '5432' : '3306'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="databaseName"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Name der Datenbank">Datenbankname</LabelWithTooltip>
                  <FormControl>
                    <Input placeholder="meine_db" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <LabelWithTooltip tooltipText="Benutzername für die Datenbank">Benutzername</LabelWithTooltip>
                  <FormControl>
                    <Input placeholder="admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <LabelWithTooltip tooltipText="Passwort für den Datenbankbenutzer (optional)">Passwort</LabelWithTooltip>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Einstellungen speichern
        </Button>
      </form>
    </Form>
  );
}
