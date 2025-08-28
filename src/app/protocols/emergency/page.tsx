import { EmergencyProtocolForm } from '@/components/protocols/EmergencyProtocolForm';
import { Header } from '@/components/layout/Header';

export default function NewEmergencyProtocolPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <EmergencyProtocolForm />
      </main>
    </div>
  );
}
