
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Calendar as CalendarIcon, Search, Truck, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { de } from 'date-fns/locale';
import { getWeek, getYear, eachWeekOfInterval, format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CreateTourModal } from '@/components/disponent/CreateTourModal';

export default function PlanungPage() {
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getWeeksForYear = (year: number) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const lastDayOfYear = new Date(year, 11, 31);
    const weeks = eachWeekOfInterval({
        start: firstDayOfYear,
        end: lastDayOfYear,
    }, { locale: de, weekStartsOn: 1 });

    return weeks.map(weekStart => ({
        weekNumber: getWeek(weekStart, { locale: de, weekStartsOn: 1 }),
        startDate: weekStart,
    }));
  }

  const [weeks, setWeeks] = useState(getWeeksForYear(selectedYear));
  const [selectedWeek, setSelectedWeek] = useState<number>(getWeek(new Date(), { locale: de }));

  const getDaysForWeek = (year: number, week: number) => {
      const weekStart = weeks.find(w => w.weekNumber === week)?.startDate;
      if (!weekStart) return [];
      const weekEnd = endOfWeek(weekStart, { locale: de, weekStartsOn: 1 });
      return eachDayOfInterval({start: weekStart, end: weekEnd});
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Tourenplanung</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Jahr</label>
                <Select
                    onValueChange={(value) => {
                        const year = parseInt(value, 10);
                        setSelectedYear(year);
                        setWeeks(getWeeksForYear(year));
                        setSelectedWeek(1); // Reset week
                    }}
                    defaultValue={selectedYear.toString()}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Woche</label>
                <Select
                    onValueChange={(value) => setSelectedWeek(parseInt(value, 10))}
                    value={selectedWeek.toString()}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {weeks.map(({weekNumber, startDate}) => <SelectItem key={startDate.toISOString()} value={weekNumber.toString()}>KW {weekNumber}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Tag</label>
                 <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Tag auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                       {getDaysForWeek(selectedYear, selectedWeek).map(day => (
                           <SelectItem key={day.toISOString()} value={day.toISOString()}>
                               {format(day, 'eeee, dd.MM', {locale: de})}
                           </SelectItem>
                       ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                 <label className="text-sm font-medium">Suche</label>
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tour, Fahrer, Fahrzeug..." className="pl-8" />
                 </div>
            </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Tourenübersicht
            </CardTitle>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tour erstellen
                </Button>
            </DialogTrigger>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Tour-Nr.</TableHead>
                    <TableHead>Fahrername</TableHead>
                    <TableHead>LKW</TableHead>
                    <TableHead>Auflieger</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead>Bemerkungen</TableHead>
                    <TableHead>Kundenref.</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Keine Touren für den ausgewählten Zeitraum.
                    </TableCell>
                </TableRow>
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        <CreateTourModal onTourCreated={() => setIsModalOpen(false)}/>
      </Dialog>


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
