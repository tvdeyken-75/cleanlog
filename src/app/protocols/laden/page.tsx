import { LoadingProtocolForm } from '@/components/protocols/LoadingProtocolForm';
import { Header } from '@/components/layout/Header';

export default function NewLoadingProtocolPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <LoadingProtocolForm />
      </main>
    </div>
  );
}
