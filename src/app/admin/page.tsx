import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Header } from '@/components/layout/Header';

export default function AdminPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <AdminDashboard />
      </main>
    </div>
  );
}
