

"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { LogIn } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginFormSchema = z.object({
    username: z.string({ required_error: "Benutzername ist ein Pflichtfeld." }),
    password: z.string().min(1, "Passwort ist ein Pflichtfeld."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;


export function LoginForm() {
  const { login, isLoading, userRoles, getUsers } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const users = getUsers().sort((a,b) => a.username.localeCompare(b.username));

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
        username: '',
        password: '',
    }
  });

  const handleLogin = (data: LoginFormValues) => {
    const loginSuccess = login(data.username, data.password);
    
    if (loginSuccess) {
      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen zurück, ${data.username}!`,
      });
      // The redirection will be based on the role fetched from the context
    } else {
      toast({
        variant: "destructive",
        title: "Fehler bei der Anmeldung",
        description: "Ungültiger Benutzername oder Passwort.",
      });
    }
  };

  useEffect(() => {
    if (userRoles) {
      if (userRoles.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/tour-selection');
      }
    }
  }, [userRoles, router]);

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
            <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                        <LabelWithTooltip htmlFor="username" tooltipText="Имя пользователя">Benutzername</LabelWithTooltip>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger id="username">
                                    <SelectValue placeholder="Wählen Sie Ihren Benutzernamen" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.username} value={user.username}>
                                        {user.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                         <LabelWithTooltip htmlFor="password" tooltipText="Пароль">Passwort</LabelWithTooltip>
                        <FormControl>
                            <Input
                            id="password"
                            type="password"
                            placeholder="Passwort"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || form.formState.isSubmitting}>
                <LogIn className="mr-2 h-5 w-5" />
                Anmelden
            </Button>
        </form>
    </Form>
  );
}
