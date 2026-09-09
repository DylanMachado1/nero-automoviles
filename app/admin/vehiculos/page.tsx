import { getBindings } from '@/db';
import { VehicleActions, VehicleCreateForm } from '@/components/admin/vehicle-admin';
import { isAdmin } from '@/services/admin-auth';

type VehicleRow = { id:string;brand:string;model:string;year:number;price:number|null;status:string;created_at:string };

export default async function Page() {
  if (!(await isAdmin())) return null;
  let rows: VehicleRow[] = [];
  try { rows = (await getBindings().db.prepare('SELECT id,brand,model,year,price,status,created_at FROM vehicles ORDER BY created_at DESC LIMIT 100').all<VehicleRow>()).results; } catch { /* empty before migration */ }
  return <main className="admin-content"><div className="admin-title"><p>CATÁLOGO</p><h1>Vehículos</h1><span>{rows.length} registros reales</span></div><VehicleCreateForm /><div className="admin-table"><table><thead><tr><th>Vehículo</th><th>Año</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{rows.map((vehicle) => <tr key={vehicle.id}><td><strong>{vehicle.brand} {vehicle.model}</strong><small>{new Date(vehicle.created_at).toLocaleDateString('es-UY')}</small></td><td>{vehicle.year}</td><td>{vehicle.price ? `USD ${Number(vehicle.price).toLocaleString('es-UY')}` : 'Consultar'}</td><td><span className={`status ${vehicle.status.toLowerCase()}`}>{vehicle.status}</span></td><td><VehicleActions id={vehicle.id} status={vehicle.status} /></td></tr>)}</tbody></table>{!rows.length && <div className="admin-table-empty">Todavía no hay vehículos. Creá el primero como borrador.</div>}</div></main>;
}
