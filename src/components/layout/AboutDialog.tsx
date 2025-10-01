
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const SETTINGS_STORAGE_KEY = 'fahrerchecklisteCompanySettings_v1';

interface CompanySettings {
  logo?: string;
  companyName?: string;
  street?: string;
  zip?: string;
  city?: string;
  country?: string;
}

export function AboutDialog() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Could not access localStorage for company settings", error);
    }
  }, []);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        {settings?.logo && (
            <div className="mx-auto w-24 h-24 relative mb-4">
                <Image src={settings.logo} alt="Firmenlogo" layout="fill" objectFit="contain" />
            </div>
        )}
        <DialogTitle className="text-center text-2xl font-headline">Fahrercheckliste</DialogTitle>
      </DialogHeader>

      <div className="text-center text-sm space-y-2">
        {settings ? (
          <div>
            <p className="font-semibold">{settings.companyName || 'Kein Firmenname festgelegt'}</p>
            <p>{settings.street || ''}</p>
            <p>{settings.zip || ''} {settings.city || ''}</p>
            <p>{settings.country || ''}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Firmeninformationen werden geladen...</p>
        )}
         <p>
            E-Mail: <a href="mailto:edv@ottospedition.de" className="text-primary hover:underline">edv@ottospedition.de</a>
        </p>
      </div>
      
      <Separator />

      <div className="flex justify-center gap-4">
        <Button variant="link">Impressum</Button>
        <Button variant="link">Datenschutz</Button>
      </div>

      <DialogFooter className="text-center text-xs text-muted-foreground pt-4 w-full justify-center">
        <p>Created by Timothy Van der Eyken 2025</p>
      </DialogFooter>
    </DialogContent>
  );
}
