
"use client";

import { VehicleManagementForm } from '@/components/admin/VehicleManagementForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';


export function FuhrparkClient() {
  return (
    <div className="space-y-6 pt-4">
        <h1 className="text-3xl font-bold font-headline">Fuhrpark verwalten</h1>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck className="text-primary"/>Fahrzeugübersicht & -verwaltung</CardTitle>
            </CardHeader>
            <CardContent>
                <VehicleManagementForm />
            </CardContent>
        </Card>
    </div>
  );
}
