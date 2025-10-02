
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Truck, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { de } from 'date-fns/locale';
import { getWeek, getYear, eachWeekOfInterval, format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tour, UserRole } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Combobox } from '@/components/ui/combobox';


export default function PlanungPage() {
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [tours, setTours] = useState<Partial<Tour>[]>([]);
  const { getUsers } = useAuth();

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
    const weekStartDate = weeks.find(w => w.weekNumber === selectedWeek)?.startDate || new Date();
      setTours(prevTours => [
          ...prevTours,
          { tourNr: getNextTourNumber(), start_time: weekStartDate }
      ]);
  }

  const handleInputChange = (index: number, field: keyof Tour, value: any) => {
      const updatedTours = [...tours];
      updatedTours[index] = { ...updatedTours[index], [field]: value };
      setTours(updatedTours);
  }
  
  const drivers = getUsers()
    .filter(u => u.role.includes('driver' as UserRole))
    .map(u => ({ value: u.username, label: u.username }));


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Tourenplanung</h1>

      <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Tourenübersicht
                </CardTitle>
                <Button size="sm" onClick={handleAddTour}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tour erstellen
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium shrink-0">Jahr</label>
                    <Select
                        onValueChange={(value) => {
                            const year = parseInt(value, 10);
                            setSelectedYear(year);
                            setWeeks(getWeeksForYear(year));
                            setSelectedWeek(1); // Reset week
                        }}
                        defaultValue={selectedYear.toString()}
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium shrink-0">Woche</label>
                    <Select
                        onValueChange={(value) => setSelectedWeek(parseInt(value, 10))}
                        value={selectedWeek.toString()}
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {weeks.map(({weekNumber, startDate}) => <SelectItem key={startDate.toISOString()} value={weekNumber.toString()}>KW {weekNumber}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium shrink-0">Tag</label>
                    <Select>
                        <SelectTrigger className="h-8">
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
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tour, Fahrer, Fahrzeug..." className="pl-8 h-8" />
                </div>
            </div>
          </CardHeader>
          <CardContent>
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead className="h-10 px-2">Tour-Nr.</TableHead>
                  <TableHead className="h-10 px-2">Datum</TableHead>
                  <TableHead className="h-10 px-2">Anfangzeit</TableHead>
                  <TableHead className="h-10 px-2">Fahrername</TableHead>
                  <TableHead className="h-10 px-2">LKW</TableHead>
                  <TableHead className="h-10 px-2">Auflieger</TableHead>
                  <TableHead className="h-10 px-2">Kunde</TableHead>
                  <TableHead className="h-10 px-2">Beschreibung</TableHead>
                  <TableHead className="h-10 px-2">Bemerkungen</TableHead>
                  <TableHead className="h-10 px-2">Kundenref.</TableHead>
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
                        <TableCell><Input type="date" value={tour.start_time ? format(new Date(tour.start_time), 'yyyy-MM-dd') : ''} onChange={e => handleInputChange(index, 'start_time', new Date(e.target.value))} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell><Input type="time" value={tour.start_time ? format(new Date(tour.start_time), 'HH:mm') : ''} onChange={e => handleInputChange(index, 'start_time', new Date(`1970-01-01T${e.target.value}`))} className="p-1 h-8 min-w-[100px]" /></TableCell>
                        <TableCell>
                           <Combobox
                                options={drivers}
                                value={tour.driver || ''}
                                onChange={(value) => handleInputChange(index, 'driver', value)}
                                placeholder="Fahrer auswählen"
                                notFoundMessage="Kein Fahrer gefunden."
                            />
                        </TableCell>
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
    </div>
  );
}

    