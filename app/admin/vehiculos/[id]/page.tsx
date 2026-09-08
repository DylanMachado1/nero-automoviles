import { notFound } from 'next/navigation';
import { VehicleEditor } from '@/components/admin/vehicle-editor';
import { getBindings } from '@/db';

export default async function VehicleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db } = getBindings();
  const vehicle = await db.prepare('SELECT * FROM vehicles WHERE id=? LIMIT 1').bind(id).first<Record<string, string | number | null>>();
  if (!vehicle) notFound();
  const images = await db.prepare('SELECT id,object_key,alt,is_primary FROM vehicle_images WHERE vehicle_id=? ORDER BY position ASC').bind(id).all<{ id: string; object_key: string; alt: string | null; is_primary: number }>();
  return (
    <main className="admin-content">
      <div className="admin-title"><p>CATÁLOGO</p><h1>Editar {vehicle.brand} {vehicle.model}</h1><span>{vehicle.status}</span></div>
      <VehicleEditor vehicle={{ ...vehicle, id }} initialImages={images.results} />
    </main>
  );
}
