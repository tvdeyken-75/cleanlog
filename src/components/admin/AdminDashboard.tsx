
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { KeyRound, Truck, Database, Image as ImageIcon } from 'lucide-react';
import { VehicleManagementForm } from './VehicleManagementForm';
import { PasswordManagementForm } from './PasswordManagementForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseSettingsForm } from './DatabaseSettingsForm';
import { LogoUploadForm } from './LogoUploadForm';

export function AdminDashboard() {
  const router = useRouter();
  const { userRole, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("vehicles");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userRole !== 'admin')) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, userRole, router]);

  if (isLoading || userRole !== 'admin') {
    return (
        <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold font-headline">Admin Panel</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="vehicles"><Truck className="mr-2 h-4 w-4"/>Fahrzeugverwaltung</TabsTrigger>
                <TabsTrigger value="password"><KeyRound className="mr-2 h-4 w-4"/>Passwortverwaltung</TabsTrigger>
                <TabsTrigger value="database"><Database className="mr-2 h-4 w-4"/>Datenbank</TabsTrigger>
                <TabsTrigger value="logo"><ImageIcon className="mr-2 h-4 w-4"/>Logo</TabsTrigger>
            </TabsList>
            <TabsContent value="vehicles">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Truck className="text-primary"/>Fahrzeugverwaltung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VehicleManagementForm />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="password">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><KeyRound className="text-primary"/>Passwortverwaltung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PasswordManagementForm />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="database">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Database className="text-primary"/>Datenbankeinstellungen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DatabaseSettingsForm />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="logo">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ImageIcon className="text-primary"/>Firmenlogo verwalten</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LogoUploadForm />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
