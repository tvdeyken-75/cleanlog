import { ProtocolForm } from '@/components/protocols/ProtocolForm';
import { Header } from '@/components/layout/Header';

export default function NewProtocolPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <ProtocolForm />
      </main>
    </div>
  );
}
