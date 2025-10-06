
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
import { Users, PlusCircle, Edit, Trash2, Phone, Mail, Building, User as UserIcon, Briefcase, Calendar, Badge } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';


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
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Vollständiger Name des Mitarbeiters">Name</LabelWithTooltip><FormControl><Input {...field} placeholder="Max Mustermann" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="position" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Position im Unternehmen" className='flex items-center gap-2'><Briefcase className='w-4 h-4' />Position</LabelWithTooltip><FormControl><Input {...field} placeholder="Fahrer" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="entryDate" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Eintrittsdatum" className='flex items-center gap-2'><Calendar className='w-4 h-4' />Eintrittsdatum</LabelWithTooltip><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
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
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Mitarbeiter bearbeiten: {editingEmployee?.name}</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleUpdateEmployee)} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                       <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <FormField control={editForm.control} name="name" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Name">Name</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={editForm.control} name="position" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Position" className='flex items-center gap-2'><Briefcase className='w-4 h-4' />Position</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={editForm.control} name="entryDate" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Eintrittsdatum" className='flex items-center gap-2'><Calendar className='w-4 h-4' />Eintrittsdatum</LabelWithTooltip><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={editForm.control} name="status" render={({ field }) => (<FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'><LabelWithTooltip tooltipText="Status des Mitarbeiters">Status</LabelWithTooltip><FormControl><Switch checked={field.value === 'active'} onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')} /></FormControl></FormItem>)} />
                            <FormField control={editForm.control} name="email" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="E-Mail" className="flex items-center gap-2"><Mail className='w-4 h-4'/>E-Mail</LabelWithTooltip><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={editForm.control} name="phone" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Telefon" className="flex items-center gap-2"><Phone className='w-4 h-4'/>Telefon</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                       </div>
                       <div className="pt-4">
                            <p className='font-medium text-lg flex items-center gap-2'><Building className='w-5 h-5 text-primary'/>Adresse</p>
                            <Separator className='my-2'/>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={editForm.control} name="street" render={({ field }) => (<FormItem className='md:col-span-2'><LabelWithTooltip tooltipText="Straße">Straße</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={editForm.control} name="zip" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="PLZ">PLZ</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={editForm.control} name="city" render={({ field }) => (<FormItem className='md:col-span-2'><LabelWithTooltip tooltipText="Stadt">Stadt</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={editForm.control} name="country" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Land">Land</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                       </div>
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
