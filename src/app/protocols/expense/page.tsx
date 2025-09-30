import { ExpenseProtocolForm } from '@/components/protocols/ExpenseProtocolForm';
import { Header } from '@/components/layout/Header';

export default function NewExpenseProtocolPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <ExpenseProtocolForm />
      </main>
    </div>
  );
}
