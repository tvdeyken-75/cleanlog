
"use client";

import { PasswordManagementForm } from '@/components/admin/PasswordManagementForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';


export function HrClient() {
  return (
    <div className="space-y-6 pt-4">
        <h1 className="text-3xl font-bold font-headline">HR - Mitarbeiter verwalten</h1>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Mitarbeiter verwalten</CardTitle>
            </CardHeader>
            <CardContent>
                <PasswordManagementForm />
            </CardContent>
        </Card>
    </div>
  );
}
