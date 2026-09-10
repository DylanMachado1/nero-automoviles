import { AdminShell } from '@/components/admin/admin-shell';
import { requireAdminPage } from '@/services/admin-auth';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage('/admin');
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
