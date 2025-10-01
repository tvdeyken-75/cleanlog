

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
import type { UserRole } from '@/lib/types';


const roleTranslations: { [key in UserRole]: string } = {
    admin: 'Admin',
    driver: 'Fahrer',
    disponent: 'Disponent',
    geschaftsfuhrer: 'Geschäftsführer',
    buchhaltung: 'Buchhaltung',
    qm_manager: 'QM-Manager'
};

const loginFormSchema = z.object({
    username: z.string().min(1, "Benutzername ist ein Pflichtfeld."),
    password: z.string().min(1, "Passwort ist ein Pflichtfeld."),
    role: z.string().optional(),
}).superRefine((data, ctx) => {
    // This logic is now handled by checking selectedUserRoles length
});

type LoginFormValues = z.infer<typeof loginFormSchema>;


export function LoginForm() {
  const { login, isLoading, activeRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { getUsers } = useAuth();
  const [selectedUserRoles, setSelectedUserRoles] = useState<UserRole[]>([]);

  const users = getUsers().sort((a,b) => a.username.localeCompare(b.username));

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
        username: '',
        password: '',
        role: undefined,
    }
  });

  const handleUserSelection = (username: string) => {
    form.setValue('username', username);
    form.setValue('role', undefined); // Reset role selection
    const user = users.find(u => u.username === username);
    const roles = user?.role || [];
    setSelectedUserRoles(roles);
    if (roles.length === 1) {
      form.setValue('role', roles[0]);
    }
  };

  const handleLogin = (data: LoginFormValues) => {
    if (selectedUserRoles.length > 1 && !data.role) {
        form.setError("role", { type: "manual", message: "Bitte wählen Sie eine Rolle." });
        return;
    }
    
    const selectedRole = (data.role || selectedUserRoles[0]) as UserRole;
    
    const loginSuccess = login(data.username, data.password, selectedRole);
    
    if (loginSuccess) {
      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen zurück, ${data.username}!`,
      });
      // Redirection is handled by useEffect
    } else {
      toast({
        variant: "destructive",
        title: "Fehler bei der Anmeldung",
        description: "Ungültiger Benutzername oder Passwort.",
      });
    }
  };

  useEffect(() => {
    if (activeRole) {
      if (activeRole === 'admin') {
        router.push('/admin');
      } else if (activeRole === 'disponent') {
        router.push('/disponent');
      } else if (activeRole === 'driver') {
        router.push('/tour-selection');
      } else {
        router.push('/');
      }
    }
  }, [activeRole, router]);

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
            <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                        <LabelWithTooltip htmlFor="username" tooltipText="Benutzername">Benutzername</LabelWithTooltip>
                        <Select onValueChange={handleUserSelection} defaultValue={field.value}>
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

            {selectedUserRoles.length > 1 && (
                 <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <LabelWithTooltip tooltipText="Wählen Sie die Rolle, mit der Sie sich anmelden möchten">Rolle auswählen</LabelWithTooltip>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wählen Sie Ihre Rolle" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {selectedUserRoles.map(role => (
                                        <SelectItem key={role} value={role}>
                                            {roleTranslations[role] || role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                         <LabelWithTooltip htmlFor="password" tooltipText="Passwort">Passwort</LabelWithTooltip>
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
