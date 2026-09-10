import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { Logo } from '@/components/nero/logo';
import { isAdmin, safeAdminReturnTo } from '@/services/admin-auth';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const returnTo = safeAdminReturnTo((await searchParams).returnTo);
  if (await isAdmin()) redirect(returnTo);

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <Logo compact />
        <div className="admin-login-heading">
          <p>NERO AUTOMÓVILES</p>
          <h1 id="admin-login-title">Panel de administración</h1>
          <span>Ingresá con las credenciales privadas de NERO.</span>
        </div>
        <AdminLoginForm returnTo={returnTo} />
      </section>
    </main>
  );
}
