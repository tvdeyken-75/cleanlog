import { TourSelectionForm } from '@/components/tour/TourSelectionForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Map } from 'lucide-react';

export default function TourSelectionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
              <Map className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-3xl">Tour beginnen</CardTitle>
            <CardDescription>Geben Sie die Details Ihrer aktuellen Tour ein, um fortzufahren.</CardDescription>
          </CardHeader>
          <CardContent>
            <TourSelectionForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
