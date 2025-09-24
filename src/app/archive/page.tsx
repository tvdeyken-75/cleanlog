
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';

export default function ArchivePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                    <Archive className="h-6 w-6 text-primary" />
                    Archiv
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>Hier werden in Zukunft archivierte Touren und Protokolle angezeigt.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
