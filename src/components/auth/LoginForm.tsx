"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { LogIn } from 'lucide-react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, getAdminPassword } = useAuth();
  const [adminPassword, setAdminPassword] = useState('admin123');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setAdminPassword(getAdminPassword());
  }, [getAdminPassword]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (username === 'demo' && password === 'demo123') {
      login(username, 'driver');
      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen zurück, ${username}!`,
      });
      router.push('/tour-selection');
    } else if (username === 'admin' && password === adminPassword) {
      login(username, 'admin');
      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen, Administrator!`,
      });
      router.push('/admin');
    } else {
      toast({
        variant: "destructive",
        title: "Fehler bei der Anmeldung",
        description: "Ungültiger Benutzername oder Passwort.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Benutzerkennung</Label>
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
        <Label htmlFor="password">Passwort</Label>
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
