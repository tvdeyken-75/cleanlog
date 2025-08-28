import { DeliveryProtocolForm } from '@/components/protocols/DeliveryProtocolForm';
import { Header } from '@/components/layout/Header';

export default function NewDeliveryProtocolPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <DeliveryProtocolForm />
      </main>
    </div>
  );
}
