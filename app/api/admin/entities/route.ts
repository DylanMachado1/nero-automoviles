import { getBindings } from '@/db';
import { slugify } from '@/lib/format';
import { requireAdmin } from '@/services/admin-auth';

const options = {
  vehicle: ['BORRADOR','PUBLICADO','RESERVADO','VENDIDO'],
  seller: ['NUEVA','CONTACTADO','ACEPTADO','RECHAZADO'],
  buyer: ['NUEVA','CONTACTADO','BUSCANDO','OPCIONES_ENVIADAS','FINALIZADA'],
  inquiry: ['NUEVA','CONTACTADO','CERRADA'],
} as const;
const tables = { vehicle:'vehicles', seller:'seller_requests', buyer:'buyer_requests', inquiry:'inquiries' } as const;
type SellerSource = {
  id:string;brand:string;model:string;year:number;version:string|null;asking_price:number|null;currency:string;
  mileage:number;fuel:string;transmission:string;engine:string|null;department:string;city:string;color:string|null;
  doors:number|null;condition:string;description:string;status:string;converted_vehicle_id:string|null;
};
type SellerImage = { object_key:string;content_type:string;size:number };

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin('/admin');
    const body = await request.json() as { id?:string; type?:keyof typeof options; action?:string; value?:string };
    if (!body.id || !body.type || !options[body.type]) throw new Error('Acción inválida.');
    const { db } = getBindings();
    const now = new Date().toISOString();
    if (body.action === 'status') {
      if (!body.value || !(options[body.type] as readonly string[]).includes(body.value)) throw new Error('Estado inválido.');
      await db.prepare(`UPDATE ${tables[body.type]} SET status=?, updated_at=? WHERE id=?`).bind(body.value, now, body.id).run();
      await db.prepare('INSERT INTO audit_events (id,admin_user_id,action,entity_type,entity_id,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),admin.userId,`STATUS:${body.value}`,body.type,body.id,now).run();
      return Response.json({ ok:true, status:body.value });
    }
    if (body.action === 'convert' && body.type === 'seller') {
      const source = await db.prepare('SELECT * FROM seller_requests WHERE id=? LIMIT 1').bind(body.id).first<SellerSource>();
      if (!source) throw new Error('Solicitud no encontrada.');
      if (source.converted_vehicle_id) return Response.json({ ok:true, status:source.status, vehicleId:source.converted_vehicle_id });
      const vehicleId = crypto.randomUUID();
      const base = slugify(`${source.brand}-${source.model}-${source.year}`);
      let slug = base, suffix = 2;
      while (await db.prepare('SELECT id FROM vehicles WHERE slug=? LIMIT 1').bind(slug).first()) slug = `${base}-${suffix++}`;
      const images = await db.prepare('SELECT object_key,content_type,size FROM seller_request_images WHERE request_id=? ORDER BY position').bind(body.id).all<SellerImage>();
      const statements = [
        db.prepare('INSERT INTO vehicles (id,slug,brand,model,version,year,price,currency,mileage,fuel,transmission,engine,department,city,color,doors,condition,description,status,seller_request_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(vehicleId,slug,source.brand,source.model,source.version,source.year,source.asking_price,source.currency,source.mileage,source.fuel,source.transmission,source.engine,source.department,source.city,source.color,source.doors,source.condition,source.description,'BORRADOR',source.id,now,now),
        ...images.results.map((image,i) => db.prepare('INSERT INTO vehicle_images (id,vehicle_id,object_key,content_type,size,position,alt,is_primary,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),vehicleId,image.object_key,image.content_type,image.size,i,`${source.brand} ${source.model} — foto ${i+1}`,i===0?1:0,now)),
        db.prepare("UPDATE seller_requests SET converted_vehicle_id=?,status='ACEPTADO',updated_at=? WHERE id=? AND converted_vehicle_id IS NULL").bind(vehicleId,now,body.id),
        db.prepare('INSERT INTO audit_events (id,admin_user_id,action,entity_type,entity_id,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),admin.userId,'CONVERT_TO_DRAFT','seller',body.id,now),
      ];
      await db.batch(statements);
      return Response.json({ ok:true, status:'ACEPTADO', vehicleId });
    }
    throw new Error('Acción no permitida.');
  } catch (error) {
    return Response.json({ ok:false, error:error instanceof Error?error.message:'No se pudo completar la acción.' }, { status:400 });
  }
}
