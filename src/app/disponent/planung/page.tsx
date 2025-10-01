

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
import { Tour } from '@/lib/types';


export default function PlanungPage() {
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tours, setTours] = useState<Partial<Tour>[]>([]);

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

  const getNextTourNumber = () => {
    const lastTourNumber = tours.length > 0 
        ? parseInt(tours[tours.length - 1].tourNr?.split('-')[1] || '10000', 10)
        : 10000;
    return `T-${String(lastTourNumber + 1).padStart(5, '0')}`;
  };

  const handleAddTour = () => {
      setTours(prevTours => [
          ...prevTours,
          { tourNr: getNextTourNumber() }
      ]);
  }

  const handleInputChange = (index: number, field: keyof Tour, value: any) => {
      const updatedTours = [...tours];
      updatedTours[index] = { ...updatedTours[index], [field]: value };
      setTours(updatedTours);
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

      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Tourenübersicht
          </CardTitle>
              <Button size="sm" onClick={handleAddTour}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tour erstellen
              </Button>
          </CardHeader>
          <CardContent>
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>Tour-Nr.</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Anfangzeit</TableHead>
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
                {tours.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground">
                        Keine Touren für den ausgewählten Zeitraum. Fügen Sie eine neue Tour hinzu.
                        </TableCell>
                    </TableRow>
                ) : (
                  tours.map((tour, index) => (
                    <TableRow key={tour.tourNr}>
                        <TableCell><Input value={tour.tourNr || ''} readOnly className="border-none bg-transparent p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input type="date" value={tour.start_time ? format(tour.start_time, 'yyyy-MM-dd') : ''} onChange={e => handleInputChange(index, 'start_time', new Date(e.target.value))} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input type="time" value={tour.start_time ? format(tour.start_time, 'HH:mm') : ''} onChange={e => handleInputChange(index, 'start_time', new Date(`1970-01-01T${e.target.value}`))} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input value={tour.driver || ''} onChange={e => handleInputChange(index, 'driver', e.target.value)} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input value={tour.truck || ''} onChange={e => handleInputChange(index, 'truck', e.target.value)} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input value={tour.trailer || ''} onChange={e => handleInputChange(index, 'trailer', e.target.value)} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input value={tour.customer || ''} onChange={e => handleInputChange(index, 'customer', e.target.value)} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input value={tour.description || ''} onChange={e => handleInputChange(index, 'description', e.target.value)} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input value={tour.remarks || ''} onChange={e => handleInputChange(index, 'remarks', e.target.value)} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input value={tour.customerRef || ''} onChange={e => handleInputChange(index, 'customerRef', e.target.value)} className="p-1 h-8 min-w-[100px]" /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
          </Table>
          </CardContent>
      </Card>

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
