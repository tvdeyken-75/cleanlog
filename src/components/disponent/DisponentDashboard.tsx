"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DisponentDashboard() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline mb-6">Disponent Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Starten wir!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dies ist Ihr neues Disponent-Dashboard. Was möchten Sie als Nächstes tun?</p>
        </CardContent>
      </Card>
    </div>
  );
}
