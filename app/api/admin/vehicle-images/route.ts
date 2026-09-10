import { getBindings } from '@/db';
import { adminApiError, requireAdmin } from '@/services/admin-auth';
import { MAX_IMAGE_SIZE, validImage } from '@/services/images';

export const runtime = 'edge';

export async function POST(request: Request) {
  const stored: string[] = [];
  try {
    const admin = await requireAdmin('/admin/vehiculos');
    const form = await request.formData();
    const vehicleValue = form.get('vehicleId');
    const vehicleId = typeof vehicleValue === 'string' ? vehicleValue : '';
    const { db, files } = getBindings();
    const vehicle = await db.prepare('SELECT brand,model FROM vehicles WHERE id=? LIMIT 1').bind(vehicleId).first<{ brand: string; model: string }>();
    if (!vehicle) throw new Error('Vehículo no encontrado.');
    const count = await db.prepare('SELECT COUNT(*) total FROM vehicle_images WHERE vehicle_id=?').bind(vehicleId).first<{ total: number }>();
    const incoming = form.getAll('images').filter((value): value is File => value instanceof File && value.size > 0);
    if (!incoming.length) throw new Error('Seleccioná al menos una imagen.');
    if ((count?.total ?? 0) + incoming.length > 12) throw new Error('Máximo 12 imágenes por vehículo.');
    const now = new Date().toISOString();
    const rows = [];
    for (let index = 0; index < incoming.length; index++) {
      const file = incoming[index];
      if (file.size > MAX_IMAGE_SIZE) throw new Error(`La imagen ${index + 1} supera 3 MB.`);
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!validImage(bytes, file.type)) throw new Error('Una imagen no tiene un formato válido.');
      const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
      const key = `public/vehicles/${vehicleId}/${crypto.randomUUID()}.${ext}`;
      await files.put(key, bytes, { httpMetadata: { contentType: file.type } });
      stored.push(key);
      const position = (count?.total ?? 0) + index;
      rows.push(db.prepare('INSERT INTO vehicle_images (id,vehicle_id,object_key,content_type,size,position,alt,is_primary,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(
        crypto.randomUUID(), vehicleId, key, file.type, file.size, position,
        `${vehicle.brand} ${vehicle.model} — foto ${position + 1}`, position === 0 ? 1 : 0, now,
      ));
    }
    rows.push(db.prepare('INSERT INTO audit_events (id,admin_user_id,action,entity_type,entity_id,created_at) VALUES (?,?,?,?,?,?)').bind(
      crypto.randomUUID(), admin.userId, 'ADD_IMAGES', 'vehicle', vehicleId, now,
    ));
    await db.batch(rows);
    return Response.json({ ok: true });
  } catch (error) {
    if (stored.length) {
      try { await getBindings().files.delete(stored); } catch { /* best-effort cleanup */ }
    }
    return adminApiError(error, 'No se pudieron subir las imágenes.');
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin('/admin/vehiculos');
    const body = await request.json() as { vehicleId?: string; imageIds?: string[]; primaryId?: string; removeId?: string };
    if (!body.vehicleId) throw new Error('Vehículo inválido.');
    const { db, files } = getBindings();
    const now = new Date().toISOString();

    if (body.removeId) {
      const image = await db.prepare('SELECT object_key FROM vehicle_images WHERE id=? AND vehicle_id=? LIMIT 1').bind(body.removeId, body.vehicleId).first<{ object_key: string }>();
      if (!image) throw new Error('Imagen no encontrada.');
      await db.prepare('DELETE FROM vehicle_images WHERE id=? AND vehicle_id=?').bind(body.removeId, body.vehicleId).run();
      const shared = await db.prepare('SELECT id FROM seller_request_images WHERE object_key=? LIMIT 1').bind(image.object_key).first();
      if (!shared) await files.delete(image.object_key);
      const first = await db.prepare('SELECT id FROM vehicle_images WHERE vehicle_id=? ORDER BY is_primary DESC,position ASC LIMIT 1').bind(body.vehicleId).first<{ id: string }>();
      if (first) await db.prepare('UPDATE vehicle_images SET is_primary=CASE WHEN id=? THEN 1 ELSE 0 END WHERE vehicle_id=?').bind(first.id, body.vehicleId).run();
    } else if (body.primaryId) {
      await db.prepare('UPDATE vehicle_images SET is_primary=CASE WHEN id=? THEN 1 ELSE 0 END WHERE vehicle_id=?').bind(body.primaryId, body.vehicleId).run();
    } else if (body.imageIds?.length) {
      const statements = body.imageIds.map((id, position) => db.prepare('UPDATE vehicle_images SET position=? WHERE id=? AND vehicle_id=?').bind(position, id, body.vehicleId));
      await db.batch(statements);
    } else {
      throw new Error('Acción inválida.');
    }
    await db.prepare('INSERT INTO audit_events (id,admin_user_id,action,entity_type,entity_id,created_at) VALUES (?,?,?,?,?,?)').bind(
      crypto.randomUUID(), admin.userId, 'UPDATE_IMAGES', 'vehicle', body.vehicleId, now,
    ).run();
    return Response.json({ ok: true });
  } catch (error) {
    return adminApiError(error, 'No se pudo actualizar la galería.');
  }
}
