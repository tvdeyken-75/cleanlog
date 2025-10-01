


"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, UserPlus, Edit, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { LabelWithTooltip } from '../ui/label-with-tooltip';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { User, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';


const userSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen lang sein."),
  password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein.").optional(),
  role: z.array(z.string()).refine(value => value.some(item => item), "Mindestens eine Rolle muss ausgewählt werden."),
}).superRefine((data, ctx) => {
    // Password is only required when creating a new user, not when editing.
    // This logic is handled during form submission.
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


export function PasswordManagementForm() {
  const { addUser, getUsers, updateUser, deleteUser } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);


  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      password: '',
      role: ['driver'],
    },
  });

  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const users = getUsers().sort((a,b) => a.username.localeCompare(b.username));

  const handleAddNewUser = (data: UserFormValues) => {
    if (!data.password) {
        form.setError("password", { type: "manual", message: "Passwort ist für neue Benutzer erforderlich." });
        return;
    }
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
        form.reset();
    } else {
        toast({
            variant: "destructive",
            title: "Fehler",
            description: `Der Benutzer ${data.username} existiert bereits.`,
        });
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    editForm.reset({
        username: user.username,
        password: '', // Password field is for changing, not displaying
        role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = (data: UserFormValues) => {
    if (!editingUser) return;
    
    updateUser(editingUser.username, {
        username: data.username,
        // Only update password if a new one is provided
        password: data.password ? data.password : undefined,
        role: data.role as UserRole[],
    });

    toast({
      title: "Benutzer aktualisiert",
      description: `Der Benutzer ${data.username} wurde erfolgreich aktualisiert.`,
    });

    setIsEditDialogOpen(false);
    setEditingUser(null);
  }

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  }

  const confirmDeleteUser = () => {
    if (!deletingUser) return;
    
    // Prevent admin from deleting themselves
    if (deletingUser.username === 'admin') {
         toast({
            variant: "destructive",
            title: "Aktion nicht erlaubt",
            description: "Der Haupt-Admin-Benutzer kann nicht gelöscht werden.",
        });
        setIsDeleteDialogOpen(false);
        return;
    }

    deleteUser(deletingUser.username);
    toast({
        title: "Benutzer gelöscht",
        description: `Der Benutzer ${deletingUser.username} wurde gelöscht.`,
    });
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  }

  const RolesMultiSelect = ({form}: {form: typeof editForm | typeof form}) => (
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
    <div className='space-y-6'>
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><UserPlus /> Neuen Benutzer anlegen</CardTitle>
                <CardDescription>Erstellen Sie neue Konten für Fahrer oder Administratoren.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddNewUser)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                        <LabelWithTooltip tooltipText="Уникальное имя пользователя">Benutzername</LabelWithTooltip>
                        <FormControl>
                            <Input {...field} placeholder="z.B. max.mustermann" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <LabelWithTooltip tooltipText="Пароль для нового пользователя">Passwort</LabelWithTooltip>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <RolesMultiSelect form={form} />
                    <Button type="submit">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Benutzer anlegen
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
        <Separator />
        <Card>
            <CardHeader>
                <CardTitle>Vorhandene Benutzer</CardTitle>
            </CardHeader>
            <CardContent>
                 <ScrollArea className='h-72 rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Benutzername</TableHead>
                                <TableHead>Rollen</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <TableRow key={user.username}>
                                        <TableCell className='font-medium'>{user.username}</TableCell>
                                        <TableCell className='capitalize truncate max-w-[200px]'>
                                          {Array.isArray(user.role) 
                                              ? user.role.map(r => roleTranslations[r] || r).join(', ') 
                                              : roleTranslations[user.role as UserRole] || user.role
                                          }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user)} className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className='text-center text-muted-foreground'>Keine Benutzer vorhanden.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Benutzer bearbeiten</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
                        <FormField
                            control={editForm.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <LabelWithTooltip tooltipText="Benutzername">Benutzername</LabelWithTooltip>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={editForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <LabelWithTooltip tooltipText="Lassen Sie das Feld leer, um das Passwort nicht zu ändern.">Neues Passwort (optional)</LabelWithTooltip>
                                    <FormControl><Input type="password" {...field} placeholder="Neues Passwort eingeben" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <RolesMultiSelect form={editForm} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Abbrechen</Button></DialogClose>
                            <Button type="submit">Speichern</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird der Benutzer 
                <span className="font-bold"> {deletingUser?.username} </span>
                dauerhaft gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
