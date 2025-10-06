

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
import { Tour, User, UserRole } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Combobox } from '@/components/ui/combobox';
import { KilometerpreisModal } from '@/components/disponent/KilometerpreisModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CreateTourModal } from '@/components/disponent/CreateTourModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { LabelWithTooltip } from '@/components/ui/label-with-tooltip';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const userSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen lang sein."),
  password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein."),
  role: z.array(z.string()).refine(value => value.some(item => item), "Mindestens eine Rolle muss ausgewählt werden."),
});
type UserFormValues = z.infer<typeof userSchema>;

const roleTranslations: { [key in UserRole]: string } = {
    admin: 'Admin',
    driver: 'Fahrer',
    disponent: 'Disponent',
    geschaftsfuhrer: 'Geschäftsführer',
    buchhaltung: 'Buchhaltung',
    qm_manager: 'QM-Manager'
};


export default function PlanungPage() {
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [tours, setTours] = useState<Partial<Tour>[]>([]);
  const { getUsers, addUser } = useAuth();
  const [isKmModalOpen, setIsKmModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Partial<Tour> | null>(null);
  const [isCreateTourModalOpen, setIsCreateTourModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [drivers, setDrivers] = useState(getUsers().filter(u => u.role.includes('driver' as UserRole)).map(u => ({ value: u.username, label: u.username })));

  const { toast } = useToast();

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      password: '',
      role: ['driver'],
    },
  });

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

  const handleInputChange = (index: number, field: keyof Tour, value: any) => {
      const updatedTours = [...tours];
      updatedTours[index] = { ...updatedTours[index], [field]: value };
      setTours(updatedTours);
  }
  
  const handleKmPreisDoubleClick = (tour: Partial<Tour>) => {
    setSelectedTour(tour);
    setIsKmModalOpen(true);
  }

  const handleSaveKmPreis = (tourNr: string, newPreis: number) => {
    setTours(tours.map(t => 
      t.tourNr === tourNr ? { ...t, kilometerpreis: newPreis } : t
    ));
    setIsKmModalOpen(false);
  }

  const handleAddNewUser = (data: UserFormValues) => {
    const success = addUser({
        username: data.username,
        password: data.password,
        role: data.role as UserRole[]
    });

    if (success) {
        toast({
            title: "Benutzer erstellt",
            description: `Der Benutzer ${data.username} wurde erfolgreich erstellt.`,
        });
        userForm.reset();
        // Refresh driver list
        setDrivers(getUsers().filter(u => u.role.includes('driver' as UserRole)).map(u => ({ value: u.username, label: u.username })));
        setIsCreateUserModalOpen(false);
    } else {
        toast({
            variant: "destructive",
            title: "Fehler",
            description: `Der Benutzer ${data.username} existiert bereits.`,
        });
    }
  };


  const RolesMultiSelect = ({form}: {form: typeof userForm }) => (
    <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
            <FormItem>
                <LabelWithTooltip tooltipText="Роль пользователя">Rollen</LabelWithTooltip>
                <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between",
                                    !field.value?.length && "text-muted-foreground"
                                )}
                            >
                                <span className='truncate'>
                                    {field.value?.length 
                                      ? field.value.map(role => roleTranslations[role as UserRole]).join(", ") 
                                      : "Rollen auswählen"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Rollen suchen..." />
                            <CommandList>
                                <CommandEmpty>Keine Rollen gefunden.</CommandEmpty>
                                <CommandGroup>
                                    {Object.entries(roleTranslations).map(([value, label]) => (
                                        <CommandItem
                                            key={value}
                                            onSelect={() => {
                                                const roles = field.value || [];
                                                const index = roles.indexOf(value);
                                                if (index > -1) {
                                                    roles.splice(index, 1);
                                                } else {
                                                    roles.push(value);
                                                }
                                                form.setValue('role', [...roles]);
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    field.value?.includes(value)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <span>{label}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <FormMessage />
            </FormItem>
        )}
    />
);



  return (
    <div className="space-y-6 pt-4">
      <h1 className="text-3xl font-bold font-headline">Tourenplanung</h1>

      <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Tourenübersicht
                </CardTitle>
                <Dialog open={isCreateTourModalOpen} onOpenChange={setIsCreateTourModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tour erstellen
                    </Button>
                  </DialogTrigger>
                  <CreateTourModal onTourCreated={() => setIsCreateTourModalOpen(false)} />
                </Dialog>
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
          <CardContent className="pb-2">
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead className="h-10 px-2">Tour-Nr.</TableHead>
                  <TableHead className="h-10 px-2">Datum</TableHead>
                  <TableHead className="h-10 px-2">Anfangzeit</TableHead>
                  <TableHead className="h-10 px-2">
                    <div className="flex items-center gap-2">
                        <span>Fahrername</span>
                         <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Neuen Mitarbeiter erstellen</DialogTitle>
                                </DialogHeader>
                                 <Form {...userForm}>
                                    <form onSubmit={userForm.handleSubmit(handleAddNewUser)} className="space-y-4">
                                        <FormField
                                            control={userForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                <LabelWithTooltip tooltipText="Benutzername">Benutzername</LabelWithTooltip>
                                                <FormControl>
                                                    <Input {...field} placeholder="z.B. max.mustermann" />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={userForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                <LabelWithTooltip tooltipText="Passwort">Passwort</LabelWithTooltip>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <RolesMultiSelect form={userForm} />
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="outline">Abbrechen</Button></DialogClose>
                                            <Button type="submit">
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Benutzer anlegen
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                         </Dialog>
                    </div>
                  </TableHead>
                  <TableHead className="h-10 px-2">LKW</TableHead>
                  <TableHead className="h-10 px-2">Auflieger</TableHead>
                  <TableHead className="h-10 px-2">Kunde</TableHead>
                  <TableHead className="h-10 px-2">Beschreibung</TableHead>
                  <TableHead className="h-10 px-2">Bemerkungen</TableHead>
                  <TableHead className="h-10 px-2">Kundenref.</TableHead>
                  <TableHead className="h-10 px-2">Kilometerpreise</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
                {tours.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground">
                        Keine Touren für den ausgewählten Zeitraum. Fügen Sie eine neue Tour hinzu.
                        </TableCell>
                    </TableRow>
                ) : (
                  tours.map((tour, index) => (
                    <TableRow key={tour.tourNr}>
                        <TableCell className="p-0"><Input value={tour.tourNr || ''} readOnly className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring" /></TableCell>
                        <TableCell className="p-0"><Input type="date" value={tour.start_time ? format(new Date(tour.start_time), 'yyyy-MM-dd') : ''} onChange={e => handleInputChange(index, 'start_time', new Date(e.target.value))} className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring" /></TableCell>
                        <TableCell className="p-0"><Input type="time" value={tour.start_time ? format(new Date(tour.start_time), 'HH:mm') : ''} onChange={e => handleInputChange(index, 'start_time', new Date(`1970-01-01T${e.target.value}`))} className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring" /></TableCell>
                        <TableCell className="p-0">
                           <Combobox
                                options={drivers}
                                value={tour.driver || ''}
                                onChange={(value) => handleInputChange(index, 'driver', value)}
                                placeholder="Fahrer auswählen"
                                notFoundMessage="Kein Fahrer gefunden."
                            />
                        </TableCell>
                        <TableCell className="p-0"><Input value={tour.truck || ''} onChange={e => handleInputChange(index, 'truck', e.target.value)} className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring" /></TableCell>
                        <TableCell className="p-0"><Input value={tour.trailer || ''} onChange={e => handleInputChange(index, 'trailer', e.target.value)} className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring" /></TableCell>
                        <TableCell className="p-0"><Input value={tour.customer || ''} onChange={e => handleInputChange(index, 'customer', e.target.value)} className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring" /></TableCell>
                        <TableCell className="p-0"><Input value={tour.description || ''} onChange={e => handleInputChange(index, 'description', e.target.value)} className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring" /></TableCell>
                        <TableCell className="p-0"><Input value={tour.remarks || ''} onChange={e => handleInputChange(index, 'remarks', e.target.value)} className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring" /></TableCell>
                        <TableCell className="p-0"><Input value={tour.customerRef || ''} onChange={e => handleInputChange(index, 'customerRef', e.target.value)} className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring" /></TableCell>
                        <TableCell className="p-0" onDoubleClick={() => handleKmPreisDoubleClick(tour)}>
                          <Input 
                            value={tour.kilometerpreis ? tour.kilometerpreis.toFixed(2) + ' €' : (tour.km && tour.rohertrag ? (tour.rohertrag / tour.km).toFixed(2) + ' €' : '')} 
                            readOnly 
                            className="border-none bg-transparent p-1 h-8 min-w-[100px] focus-visible:ring-1 focus-visible:ring-ring cursor-pointer" 
                          />
                        </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
          </Table>
          </CardContent>
      </Card>
      
      <Dialog open={isKmModalOpen} onOpenChange={setIsKmModalOpen}>
        {selectedTour && (
            <KilometerpreisModal 
                tour={selectedTour} 
                onSave={handleSaveKmPreis}
                onClose={() => setIsKmModalOpen(false)}
            />
        )}
      </Dialog>
    </div>
  );
}
