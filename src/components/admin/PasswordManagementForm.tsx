
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, UserPlus } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { UserRole } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const newUserSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen lang sein."),
  password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein."),
  role: z.enum(['driver', 'admin'], { required_error: "Rolle ist ein Pflichtfeld."}),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

export function PasswordManagementForm() {
  const { addUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'driver',
    },
  });

  const onSubmit = (data: NewUserFormValues) => {
    const success = addUser({
        username: data.username,
        password: data.password,
        role: data.role as UserRole
    });

    if (success) {
        toast({
            title: "Benutzer erstellt",
            description: `Der Benutzer ${data.username} wurde erfolgreich erstellt.`,
        });
        form.reset();
    } else {
        toast({
            variant: "destructive",
            title: "Fehler",
            description: `Der Benutzer ${data.username} existiert bereits.`,
        });
    }
  };

  return (
    <div className='space-y-6'>
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><UserPlus /> Neuen Benutzer anlegen</CardTitle>
                <CardDescription>Erstellen Sie neue Konten für Fahrer oder Administratoren.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                        <LabelWithTooltip tooltipText="Уникальное имя пользователя">Benutzername</LabelWithTooltip>
                        <FormControl>
                            <Input {...field} placeholder="z.B. max.mustermann" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <LabelWithTooltip tooltipText="Пароль для нового пользователя">Passwort</LabelWithTooltip>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <LabelWithTooltip tooltipText="Роль пользователя">Rolle</LabelWithTooltip>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="driver">Fahrer</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Benutzer anlegen
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}

