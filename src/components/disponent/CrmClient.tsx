
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function CrmClient() {
  return (
    <div className="space-y-6 pt-4">
        <h1 className="text-3xl font-bold font-headline">CRM</h1>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Kunden- & Lieferantenverwaltung</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Hier können Sie Kunden und Lieferanten verwalten.</p>
            </CardContent>
        </Card>
    </div>
  );
}
