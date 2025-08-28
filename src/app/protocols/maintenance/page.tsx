import { MaintenanceProtocolForm } from '@/components/protocols/MaintenanceProtocolForm';
import { Header } from '@/components/layout/Header';
import { Suspense } from 'react';

export default function NewMaintenanceProtocolPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <MaintenanceProtocolForm />
        </Suspense>
      </main>
    </div>
  );
}
