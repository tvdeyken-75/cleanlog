import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { Header } from '@/components/layout/Header';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <DashboardClient />
      </main>
    </div>
  );
}
