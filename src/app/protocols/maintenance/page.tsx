import { MaintenanceProtocolForm } from '@/components/protocols/MaintenanceProtocolForm';
import { Header } from '@/components/layout/Header';

export default function NewMaintenanceProtocolPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <MaintenanceProtocolForm />
      </main>
    </div>
  );
}
