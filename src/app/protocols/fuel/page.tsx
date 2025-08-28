import { FuelProtocolForm } from '@/components/protocols/FuelProtocolForm';
import { Header } from '@/components/layout/Header';

export default function NewFuelProtocolPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <FuelProtocolForm />
      </main>
    </div>
  );
}
