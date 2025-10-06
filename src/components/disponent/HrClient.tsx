

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useProtocols } from '@/hooks/useProtocols';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/lib/types';
import { format, parseISO } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { Users, PlusCircle, Edit, Trash2, Phone, Mail, Building, User as UserIcon, Briefcase, Calendar, Badge, DollarSign, Wallet, HeartPulse, Clock } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';


const employeeSchema = z.object({
  name: z.string().min(1, "Name ist ein Pflichtfeld."),
  position: z.string().min(1, "Position ist ein Pflichtfeld."),
  entryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Gültiges Datum erforderlich."}),
  status: z.enum(['active', 'inactive']).default('active'),
  email: z.string().email("Ungültige E-Mail-Adresse.").optional().or(z.literal('')),
  phone: z.string().optional(),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  // Lohn
  hourlyRate: z.coerce.number().optional(),
  monthlySalary: z.coerce.number().optional(),
  // Kosten
  costCenter: z.string().optional(),
  // Versicherung
  socialSecurityNumber: z.string().optional(),
  healthInsurance: z.string().optional(),
  // Arbeitszeiten
  weeklyHours: z.coerce.number().optional(),
  vacationDays: z.coerce.number().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export function HrClient() {
  const { user } = useAuth();
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useProtocols(user);
  const { toast } = useToast();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { 
        name: '',
        position: '',
        entryDate: '',
        status: 'active',
        email: '',
        phone: '',
        street: '',
        zip: '',
        city: '',
        country: '',
        hourlyRate: undefined,
        monthlySalary: undefined,
        costCenter: '',
        socialSecurityNumber: '',
        healthInsurance: '',
        weeklyHours: undefined,
        vacationDays: undefined,
    },
  });

  const editForm = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
  });

  const handleAddNewEmployee = (data: EmployeeFormValues) => {
    const success = addEmployee(data);
    if (success) {
      toast({ title: "Mitarbeiter hinzugefügt", description: `${data.name} wurde erfolgreich erstellt.` });
      form.reset({ name: '', position: '', entryDate: '', status: 'active', email: '', phone: '', street: '', zip: '', city: '', country: '' });
    } else {
      toast({ variant: "destructive", title: "Fehler", description: `Ein Mitarbeiter mit dem Namen ${data.name} existiert bereits.` });
    }
  };

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    editForm.reset(employee);
  };

  const handleUpdateEmployee = (data: EmployeeFormValues) => {
    if (!editingEmployee) return;
    updateEmployee(editingEmployee.id, data);
    toast({ title: "Aktualisiert", description: `${data.name} wurde aktualisiert.` });
    setEditingEmployee(null);
  };

  const handleDeleteClick = (employee: Employee) => {
    setDeletingEmployee(employee);
  };

  const confirmDeleteEmployee = () => {
    if (!deletingEmployee) return;
    deleteEmployee(deletingEmployee.id);
    toast({ title: "Gelöscht", description: `${deletingEmployee.name} wurde gelöscht.` });
    setDeletingEmployee(null);
  };
  
  const sortedEmployees = employees.sort((a, b) => a.name.localeCompare(b.name));

  const renderFormFields = (formInstance: typeof form | typeof editForm) => (
    <>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <FormField control={formInstance.control} name="name" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Vollständiger Name des Mitarbeiters">Name</LabelWithTooltip><FormControl><Input {...field} placeholder="Max Mustermann" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={formInstance.control} name="position" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Position im Unternehmen" className='flex items-center gap-2'><Briefcase className='w-4 h-4' />Position</LabelWithTooltip><FormControl><Input {...field} placeholder="Fahrer" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={formInstance.control} name="entryDate" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Eintrittsdatum" className='flex items-center gap-2'><Calendar className='w-4 h-4' />Eintrittsdatum</LabelWithTooltip><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        
        <Collapsible className="space-y-2">
            <CollapsibleTrigger className="w-full">
                <div className="flex w-full justify-between items-center p-2 bg-muted rounded-md cursor-pointer">
                    <p className='font-medium text-lg flex items-center gap-2'><Building className='w-5 h-5 text-primary'/>Kontakt & Adresse</p>
                    <ChevronsUpDown className="h-4 w-4" />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border rounded-md">
                 <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField control={formInstance.control} name="email" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="E-Mail-Adresse" className="flex items-center gap-2"><Mail className='w-4 h-4'/>E-Mail</LabelWithTooltip><FormControl><Input type="email" {...field} placeholder="max.mustermann@mail.de" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={formInstance.control} name="phone" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Telefonnummer" className="flex items-center gap-2"><Phone className='w-4 h-4'/>Telefon</LabelWithTooltip><FormControl><Input {...field} placeholder="+49 123 456789" /></FormControl><FormMessage /></FormItem>)} />
                 </div>
                 <Separator className='my-4' />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={formInstance.control} name="street" render={({ field }) => (<FormItem className='md:col-span-2'><LabelWithTooltip tooltipText="Straße und Hausnummer">Straße</LabelWithTooltip><FormControl><Input {...field} placeholder="Musterstraße 1" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={formInstance.control} name="zip" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Postleitzahl">PLZ</LabelWithTooltip><FormControl><Input {...field} placeholder="12345" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={formInstance.control} name="city" render={({ field }) => (<FormItem className='md:col-span-2'><LabelWithTooltip tooltipText="Stadt">Stadt</LabelWithTooltip><FormControl><Input {...field} placeholder="Musterstadt" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={formInstance.control} name="country" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Land">Land</LabelWithTooltip><FormControl><Input {...field} placeholder="Deutschland" /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </CollapsibleContent>
        </Collapsible>
        
        <Collapsible className="space-y-2">
            <CollapsibleTrigger className="w-full">
                <div className="flex w-full justify-between items-center p-2 bg-muted rounded-md cursor-pointer">
                    <p className='font-medium text-lg flex items-center gap-2'><DollarSign className='w-5 h-5 text-primary'/>Lohn & Kosten</p>
                    <ChevronsUpDown className="h-4 w-4" />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={formInstance.control} name="hourlyRate" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Stundensatz">Stundensatz (€)</LabelWithTooltip><FormControl><Input type="number" {...field} placeholder="15.50" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={formInstance.control} name="monthlySalary" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Monatsgehalt">Monatsgehalt (€)</LabelWithTooltip><FormControl><Input type="number" {...field} placeholder="3200" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={formInstance.control} name="costCenter" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Kostenstelle" className="flex items-center gap-2"><Wallet className='w-4 h-4' />Kostenstelle</LabelWithTooltip><FormControl><Input {...field} placeholder="z.B. Fuhrpark" /></FormControl><FormMessage /></FormItem>)} />
            </CollapsibleContent>
        </Collapsible>

        <Collapsible className="space-y-2">
            <CollapsibleTrigger className="w-full">
                <div className="flex w-full justify-between items-center p-2 bg-muted rounded-md cursor-pointer">
                    <p className='font-medium text-lg flex items-center gap-2'><HeartPulse className='w-5 h-5 text-primary'/>Versicherung</p>
                    <ChevronsUpDown className="h-4 w-4" />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={formInstance.control} name="socialSecurityNumber" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Sozialversicherungsnummer">SV-Nummer</LabelWithTooltip><FormControl><Input {...field} placeholder="z.B. 12 123456 A 123" /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={formInstance.control} name="healthInsurance" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Krankenkasse">Krankenkasse</LabelWithTooltip><FormControl><Input {...field} placeholder="z.B. AOK" /></FormControl><FormMessage /></FormItem>)} />
            </CollapsibleContent>
        </Collapsible>

         <Collapsible className="space-y-2">
            <CollapsibleTrigger className="w-full">
                <div className="flex w-full justify-between items-center p-2 bg-muted rounded-md cursor-pointer">
                    <p className='font-medium text-lg flex items-center gap-2'><Clock className='w-5 h-5 text-primary'/>Arbeitszeiten</p>
                    <ChevronsUpDown className="h-4 w-4" />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={formInstance.control} name="weeklyHours" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Wochenstunden">Wochenstunden</LabelWithTooltip><FormControl><Input type="number" {...field} placeholder="40" /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={formInstance.control} name="vacationDays" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Urlaubstage pro Jahr">Urlaubstage/Jahr</LabelWithTooltip><FormControl><Input type="number" {...field} placeholder="30" /></FormControl><FormMessage /></FormItem>)} />
            </CollapsibleContent>
        </Collapsible>
    </>
  );

  return (
    <div className="space-y-6 pt-4">
        <h1 className="text-3xl font-bold font-headline">HR - Mitarbeiter</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle className="text-primary"/>Neuen Mitarbeiter anlegen</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddNewEmployee)} className="space-y-4">
                {renderFormFields(form)}
                <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" />Mitarbeiter anlegen</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Mitarbeiterliste</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className='h-[28rem] rounded-md border'>
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Eintrittsdatum</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedEmployees.length > 0 ? (
                        sortedEmployees.map(employee => (
                            <TableRow key={employee.id}>
                            <TableCell className='font-medium'>{employee.name}</TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell>{format(parseISO(employee.entryDate), 'dd.MM.yyyy')}</TableCell>
                            <TableCell>
                                <Badge variant={employee.status === 'active' ? 'secondary' : 'outline'}>
                                    {employee.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(employee)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(employee)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow><TableCell colSpan={5} className='text-center text-muted-foreground'>Keine Mitarbeiter vorhanden.</TableCell></TableRow>
                        )}
                    </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingEmployee} onOpenChange={(isOpen) => !isOpen && setEditingEmployee(null)}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Mitarbeiter bearbeiten: {editingEmployee?.name}</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleUpdateEmployee)} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                       <FormField control={editForm.control} name="status" render={({ field }) => (<FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'><LabelWithTooltip tooltipText="Status des Mitarbeiters">Status</LabelWithTooltip><FormControl><Switch checked={field.value === 'active'} onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')} /></FormControl></FormItem>)} />
                       {renderFormFields(editForm)}
                      <DialogFooter className='pt-4'>
                          <DialogClose asChild><Button type="button" variant="outline">Abbrechen</Button></DialogClose>
                          <Button type="submit">Speichern</Button>
                      </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!deletingEmployee} onOpenChange={(isOpen) => !isOpen && setDeletingEmployee(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird der Mitarbeiter 
                <span className="font-bold"> {deletingEmployee?.name} </span>
                dauerhaft gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteEmployee} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
