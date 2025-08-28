import type { Metadata } from 'next';
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/context/AuthContext';
import { TourProvider } from '@/context/TourContext';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'FahrerLogbuch',
  description: 'Protokoll-Manager für die Reinigung von Kühlladeräumen',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased bg-background")}>
        <AuthProvider>
          <TourProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </TourProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
