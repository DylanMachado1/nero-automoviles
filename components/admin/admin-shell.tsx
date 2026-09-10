import { BarChart3, CarFront, FileText, LogOut, MessageSquare, Search } from 'lucide-react';
import { Logo } from '@/components/nero/logo';
import { sitePath } from '@/lib/brand';
import type { AdminSession } from '@/services/admin-auth';

const links = [
  ['Panel', '/admin', BarChart3],
  ['Vehículos', '/admin/vehiculos', CarFront],
  ['Solicitudes de venta', '/admin/solicitudes-venta', FileText],
  ['Búsquedas', '/admin/busquedas', Search],
  ['Consultas', '/admin/consultas', MessageSquare],
] as const;

function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={sitePath('/api/admin/logout')} method="post" className={compact ? 'admin-header-logout' : 'admin-sidebar-logout'}>
      <button className="admin-signout" type="submit">
        <LogOut />
        <span>Cerrar sesión</span>
      </button>
    </form>
  );
}

export function AdminShell({ children, admin }: { children: React.ReactNode; admin: AdminSession }) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <a href={sitePath('/')} aria-label="Ir al sitio público de NERO">
          <Logo compact />
        </a>
        <nav aria-label="Navegación administrativa">
          {links.map(([label, href, Icon]) => (
            <a href={sitePath(href)} key={href}>
              <Icon />
              {label}
            </a>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <div className="admin-surface">
        <header>
          <div className="admin-identity">
            <span>Panel privado</span>
            <strong>{admin.displayName}</strong>
          </div>
          <div className="admin-header-actions">
            <a href={sitePath('/')} target="_blank" rel="noreferrer">
              Ver sitio ↗
            </a>
            <LogoutButton compact />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
