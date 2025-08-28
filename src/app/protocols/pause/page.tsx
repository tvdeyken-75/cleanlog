import { PauseProtocolForm } from '@/components/protocols/PauseProtocolForm';
import { Header } from '@/components/layout/Header';

export default function NewPauseProtocolPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <PauseProtocolForm />
      </main>
    </div>
  );
}
