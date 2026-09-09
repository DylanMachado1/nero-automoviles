import { getBindings } from '@/db';
import { requireAdmin } from '@/services/admin-auth';
import { integer, optional, required } from '@/validators/requests';

export const runtime = 'edge';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin('/admin/vehiculos');
    const { id } = await params;
    const form = await request.formData();
    const { db } = getBindings();
    const now = new Date().toISOString();
    const exists = await db.prepare('SELECT id FROM vehicles WHERE id=? LIMIT 1').bind(id).first();
    if (!exists) return Response.json({ ok: false, error: 'Vehículo no encontrado.' }, { status: 404 });

    await db.batch([
      db.prepare(`UPDATE vehicles SET brand=?,model=?,version=?,year=?,price=?,currency=?,mileage=?,fuel=?,transmission=?,engine=?,department=?,city=?,color=?,doors=?,condition=?,description=?,equipment=?,additional_info=?,review_notes=?,updated_at=? WHERE id=?`).bind(
        required(form, 'brand', 'la marca'),
        required(form, 'model', 'el modelo'),
        optional(form, 'version'),
        integer(form, 'year', 'El año', 1900, new Date().getFullYear() + 1),
        integer(form, 'price', 'El precio', 0, 100000000, true),
        required(form, 'currency', 'la moneda'),
        integer(form, 'mileage', 'El kilometraje', 0, 2000000),
        required(form, 'fuel', 'el combustible'),
        required(form, 'transmission', 'la transmisión'),
        optional(form, 'engine'),
        required(form, 'department', 'el departamento'),
        required(form, 'city', 'la ciudad'),
        optional(form, 'color'),
        integer(form, 'doors', 'Las puertas', 2, 6, true),
        optional(form, 'condition'),
        required(form, 'description', 'la descripción', 3000),
        optional(form, 'equipment', 5000),
        optional(form, 'additionalInfo', 3000),
        optional(form, 'reviewNotes', 3000),
        now,
        id,
      ),
      db.prepare('INSERT INTO audit_events (id,admin_user_id,action,entity_type,entity_id,created_at) VALUES (?,?,?,?,?,?)').bind(
        crypto.randomUUID(), admin.userId, 'UPDATE', 'vehicle', id, now,
      ),
    ]);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudo actualizar.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    const admin = await requireAdmin('/admin/vehiculos');
    const { id } = await params;
    const { db, files } = getBindings();
    const images = await db.prepare('SELECT object_key FROM vehicle_images WHERE vehicle_id=?').bind(id).all<{ object_key: string }>();
    const now = new Date().toISOString();
    await db.batch([
      db.prepare('DELETE FROM vehicle_images WHERE vehicle_id=?').bind(id),
      db.prepare('UPDATE inquiries SET vehicle_id=NULL,updated_at=? WHERE vehicle_id=?').bind(now, id),
      db.prepare('DELETE FROM vehicles WHERE id=?').bind(id),
      db.prepare('INSERT INTO audit_events (id,admin_user_id,action,entity_type,entity_id,created_at) VALUES (?,?,?,?,?,?)').bind(
        crypto.randomUUID(), admin.userId, 'DELETE', 'vehicle', id, now,
      ),
    ]);
    if (images.results.length) await files.delete(images.results.map((image) => image.object_key));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudo eliminar.' }, { status: 400 });
  }
}
