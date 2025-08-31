
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { LogIn } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, userRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const loginSuccess = login(username, password);
    
    if (loginSuccess) {
      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen zurück, ${username}!`,
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
    if (userRole) {
      if (userRole === 'admin') {
        router.push('/admin');
      } else {
        router.push('/tour-selection');
      }
    }
  }, [userRole, router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <LabelWithTooltip htmlFor="username" tooltipText="Имя пользователя">Benutzerkennung</LabelWithTooltip>
        <Input
          id="username"
          type="text"
          placeholder="demo / admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <LabelWithTooltip htmlFor="password" tooltipText="Пароль">Passwort</LabelWithTooltip>
        <Input
          id="password"
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
        <LogIn className="mr-2 h-5 w-5" />
        Anmelden
      </Button>
    </form>
  );
}
