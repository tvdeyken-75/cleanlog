import { LogoutButton } from '@/components/auth/LogoutButton';
import { TourSelectionForm } from '@/components/tour/TourSelectionForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export default function TourSelectionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                <Wrench className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-3xl">Tour oder Wartung</CardTitle>
            <CardDescription>Beginnen Sie eine neue Tour oder erstellen Sie ein Wartungsprotokoll.</CardDescription>
          </CardHeader>
          <CardContent>
            <TourSelectionForm />
          </CardContent>
          <CardFooter className="flex justify-center">
            <LogoutButton />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
