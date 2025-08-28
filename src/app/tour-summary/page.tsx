
import { TourSummaryClient } from '@/components/tour/TourSummaryClient';
import { Header } from '@/components/layout/Header';

export default function TourSummaryPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <TourSummaryClient />
      </main>
    </div>
  );
}
