
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Calendar as CalendarIcon, CalendarRange, Truck } from 'lucide-react';
import { useState } from 'react';
import { de } from 'date-fns/locale';

export default function PlanungPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Tourenplanung</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top-left: Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Kalender
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                locale={de}
              />
            </CardContent>
          </Card>
        </div>

        {/* Top-right: Week Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-primary" />
                Wochenkalender
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-md">
                <p className="text-muted-foreground">Wochenkalender-Ansicht kommt hier hin.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle: Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Tourenübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour</TableHead>
                <TableHead>Fahrer</TableHead>
                <TableHead>Fahrzeug</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Ende</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Keine Touren für den ausgewählten Zeitraum.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bottom: Tour Finances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Tourfinanzen
          </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                <p className="text-muted-foreground">Finanzübersicht der Touren kommt hier hin.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
