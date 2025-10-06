

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useProtocols } from '@/hooks/useProtocols';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { Users, PlusCircle, Edit, Trash2, Phone, Mail, Building, User as UserIcon } from 'lucide-react';


const customerSchema = z.object({
  name: z.string().min(1, "Name ist ein Pflichtfeld."),
  type: z.enum(['customer', 'supplier'], { required_error: "Typ ist ein Pflichtfeld."}),
  customerNumber: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse.").optional().or(z.literal('')),
  phone: z.string().optional(),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CrmClient() {
  const { user } = useAuth();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useProtocols(user);
  const { toast } = useToast();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { type: 'customer' },
  });

  const editForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const handleAddNewCustomer = (data: CustomerFormValues) => {
    const success = addCustomer(data);
    if (success) {
      toast({ title: "Erfolgreich hinzugefügt", description: `${data.name} wurde hinzugefügt.` });
      form.reset({ type: 'customer', name: '', customerNumber: '', contactPerson: '', email: '', phone: '', street: '', zip: '', city: '', country: '' });
    } else {
      toast({ variant: "destructive", title: "Fehler", description: `Ein Eintrag mit dem Namen ${data.name} existiert bereits.` });
    }
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    editForm.reset(customer);
  };

  const handleUpdateCustomer = (data: CustomerFormValues) => {
    if (!editingCustomer) return;
    updateCustomer(editingCustomer.id, data);
    toast({ title: "Aktualisiert", description: `${data.name} wurde aktualisiert.` });
    setEditingCustomer(null);
  };

  const handleDeleteClick = (customer: Customer) => {
    setDeletingCustomer(customer);
  };

  const confirmDeleteCustomer = () => {
    if (!deletingCustomer) return;
    deleteCustomer(deletingCustomer.id);
    toast({ title: "Gelöscht", description: `${deletingCustomer.name} wurde gelöscht.` });
    setDeletingCustomer(null);
  };

  const renderCustomerTable = (type: 'customer' | 'supplier') => {
    const data = customers.filter(c => c.type === type).sort((a, b) => a.name.localeCompare(b.name));
    return (
      <ScrollArea className='h-96 rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kontaktperson</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell className='font-medium'>{customer.name}</TableCell>
                  <TableCell>{customer.contactPerson || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(customer)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(customer)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className='text-center text-muted-foreground'>Keine Einträge vorhanden.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-6 pt-4">
        <h1 className="text-3xl font-bold font-headline">CRM</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusCircle className="text-primary"/>Neuen Eintrag hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddNewCustomer)} className="space-y-4">
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <FormField control={form.control} name="name" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Name des Kunden/Lieferanten">Name</LabelWithTooltip><FormControl><Input {...field} placeholder="Firma ABC" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="type" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Typ des Eintrags">Typ</LabelWithTooltip><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="customer">Kunde</SelectItem><SelectItem value="supplier">Lieferant</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="customerNumber" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Interne Kunden-/Lieferantennummer">Kundennummer</LabelWithTooltip><FormControl><Input {...field} placeholder="KD-12345" /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" />Eintrag hinzufügen</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Kunden- & Lieferantenverwaltung</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="customers">
                    <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value="customers">Kunden</TabsTrigger>
                        <TabsTrigger value="suppliers">Lieferanten</TabsTrigger>
                    </TabsList>
                    <TabsContent value="customers" className='mt-4'>
                        {renderCustomerTable('customer')}
                    </TabsContent>
                    <TabsContent value="suppliers" className='mt-4'>
                        {renderCustomerTable('supplier')}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingCustomer} onOpenChange={(isOpen) => !isOpen && setEditingCustomer(null)}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Eintrag bearbeiten: {editingCustomer?.name}</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleUpdateCustomer)} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField control={editForm.control} name="name" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Name">Name</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={editForm.control} name="customerNumber" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Kundennummer">Kundennummer</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={editForm.control} name="contactPerson" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Ansprechpartner" className="flex items-center gap-2"><UserIcon className='w-4 h-4'/>Ansprechpartner</LabelWithTooltip><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={editForm.control} name="type" render={({ field }) => (<FormItem><LabelWithTooltip tooltipText="Typ">Typ</LabelWithTooltip><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="customer">Kunde</SelectItem><SelectItem value="supplier">Lieferant</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
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
        <AlertDialog open={!!deletingCustomer} onOpenChange={(isOpen) => !isOpen && setDeletingCustomer(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird der Eintrag 
                <span className="font-bold"> {deletingCustomer?.name} </span>
                dauerhaft gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCustomer} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
