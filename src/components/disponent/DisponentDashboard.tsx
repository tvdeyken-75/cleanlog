
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Truck } from 'lucide-react';

export function DisponentDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">AmbientTMS Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Willkommen!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dies ist die Hauptseite für die Disponenten.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktive Touren
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 seit gestern
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Auslastung
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +5% im Vergleich zum Vormonat
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
