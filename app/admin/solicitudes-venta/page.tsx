import { EntityActions } from '@/components/admin/entity-table';
import { getBindings } from '@/db';
import { isAdmin } from '@/services/admin-auth';

type SellerRow = {
  id: string; name: string; phone: string; email: string | null; brand: string; model: string;
  year: number; mileage: number; city: string; department: string; asking_price: number | null;
  registration:string|null;registry_number:string|null;is_owner:string;debt_status:string;lien_status:string;accepts_trade_in:string;minimum_price:number|null;minimum_price_basis:string|null;visit_zone:string;
  status: string; converted_vehicle_id: string | null; description: string; created_at: string;
};
type PhotoRow = { request_id: string; object_key: string; total: number };

const fileUrl = (key: string) => `/api/admin/files/${key.split('/').map(encodeURIComponent).join('/')}`;
const answer = (value: string) => ({ yes: 'Sí', no: 'No', unknown: 'No sé' }[value] ?? value);
const minimumBasis = (value: string | null) => ({ total_sale_price: 'Precio mínimo total de venta', net_to_owner: 'Monto neto para el propietario luego de la comisión' }[value ?? ''] ?? 'Base no indicada');

export default async function Page() {
  if (!(await isAdmin())) return null;
  let rows: SellerRow[] = [];
  let photos: PhotoRow[] = [];
  try {
    const db = getBindings().db;
    rows = (await db.prepare('SELECT id,name,phone,email,brand,model,year,mileage,city,department,asking_price,registration,registry_number,is_owner,debt_status,lien_status,accepts_trade_in,minimum_price,minimum_price_basis,visit_zone,status,converted_vehicle_id,description,created_at FROM seller_requests ORDER BY created_at DESC LIMIT 100').all<SellerRow>()).results;
    if (rows.length) {
      const placeholders = rows.map(() => '?').join(',');
      photos = (await db.prepare(`WITH ranked AS (SELECT request_id,object_key,ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY position ASC) rank,COUNT(*) OVER (PARTITION BY request_id) total FROM seller_request_images WHERE request_id IN (${placeholders})) SELECT request_id,object_key,total FROM ranked WHERE rank<=4 ORDER BY request_id,rank`).bind(...rows.map((row) => row.id)).all<PhotoRow>()).results;
    }
  } catch { /* empty state before the first migration */ }
  const photosByRequest = new Map<string, PhotoRow[]>();
  for (const photo of photos) photosByRequest.set(photo.request_id, [...(photosByRequest.get(photo.request_id) ?? []), photo]);
  return (
    <main className="admin-content">
      <div className="admin-title"><p>CAPTACIÓN</p><h1>Solicitudes de venta</h1><span>{rows.length} solicitudes</span></div>
      <div className="admin-table"><table><thead><tr><th>Propietario</th><th>Vehículo</th><th>Datos privados</th><th>Ubicación</th><th>Precio</th><th>Fotos</th><th>Fecha</th><th>Gestión</th></tr></thead><tbody>
        {rows.map((row) => {
          const requestPhotos = photosByRequest.get(row.id) ?? [];
          return <tr key={row.id}>
            <td><strong>{row.name}</strong><small>{row.phone}<br />{row.email}</small></td>
            <td><strong>{row.brand} {row.model}</strong><small>{row.year} · {Number(row.mileage).toLocaleString('es-UY')} km<br />{row.description}</small></td>
            <td><small>Matrícula: {row.registration||'No indicada'}<br/>Padrón: {row.registry_number||'No indicado'}<br/>Titular: {answer(row.is_owner)} · Deuda: {answer(row.debt_status)}<br/>Gravamen: {answer(row.lien_status)} · Permuta: {answer(row.accepts_trade_in)}<br/>Mínimo: {row.minimum_price?`USD ${Number(row.minimum_price).toLocaleString('es-UY')}`:'No indicado'}<br/>Base del mínimo: {row.minimum_price ? minimumBasis(row.minimum_price_basis) : 'No corresponde'}<br/>Visita: {row.visit_zone}</small></td>
            <td>{row.city}, {row.department}</td>
            <td>{row.asking_price ? `USD ${Number(row.asking_price).toLocaleString('es-UY')}` : 'Sin indicar'}</td>
            <td><div className="seller-photo-strip">{requestPhotos.map((photo, index) => <a key={photo.object_key} href={fileUrl(photo.object_key)} target="_blank" rel="noreferrer"><img src={fileUrl(photo.object_key)} alt={`Foto ${index + 1} de ${row.brand} ${row.model}`} width={42} height={42} loading="lazy" decoding="async" /></a>)}{requestPhotos[0]?.total > 4 && <small>+{requestPhotos[0].total - 4}</small>}</div></td>
            <td>{new Date(row.created_at).toLocaleDateString('es-UY')}</td>
            <td><EntityActions id={row.id} type="seller" status={row.status} options={['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA']} convert={row.status === 'ACEPTADA' && !row.converted_vehicle_id} /></td>
          </tr>;
        })}
      </tbody></table>{!rows.length && <div className="admin-table-empty">No hay solicitudes de venta.</div>}</div>
    </main>
  );
}
