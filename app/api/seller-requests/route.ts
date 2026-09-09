import { getBindings } from '@/db';
import { enforceRateLimit } from '@/lib/rate-limit';
import { assertHoneypot, assertSameOrigin, email, integer, optional, phone, required } from '@/validators/requests';

export const runtime = 'edge';
const MAX_FILES = 12, MAX_FILE_SIZE = 3 * 1024 * 1024, MAX_TOTAL = 24 * 1024 * 1024;
const yesNo = new Set(['yes', 'no']);
const yesNoUnknown = new Set(['yes', 'no', 'unknown']);
const minimumPriceBases = new Set(['total_sale_price', 'net_to_owner']);

function validImage(bytes: Uint8Array, type: string) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === 'image/webp') return new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  return false;
}

function choice(form: FormData, name: string, label: string, allowed: Set<string>) {
  const value = required(form, name, label, 30);
  if (!allowed.has(value)) throw new Error(`La opción de ${label} no es válida.`);
  return value;
}

export async function POST(request: Request) {
  const stored: string[] = [];
  try {
    assertSameOrigin(request); await enforceRateLimit(request, 'seller');
    const len = Number(request.headers.get('content-length') ?? 0);
    if (len > MAX_TOTAL + 1024 * 1024) throw new Error('La carga supera el máximo permitido.');
    const form = await request.formData(); assertHoneypot(form);
    if (form.get('terms') !== 'on') throw new Error('Necesitamos que aceptes las condiciones para continuar.');
    const images = form.getAll('images').filter((value): value is File => value instanceof File && value.size > 0);
    if (images.length > MAX_FILES) throw new Error(`Podés adjuntar hasta ${MAX_FILES} fotos.`);
    if (images.reduce((total, file) => total + file.size, 0) > MAX_TOTAL) throw new Error('Las fotos superan el límite total de 24 MB.');

    const minimumPrice = integer(form, 'minimumPrice', 'El precio mínimo', 0, 100000000, true);
    const minimumPriceBasis = optional(form, 'minimumPriceBasis', 30);
    if (minimumPrice !== null && !minimumPriceBasis) throw new Error('Indicá a qué corresponde el precio mínimo.');
    if (minimumPriceBasis && !minimumPriceBases.has(minimumPriceBasis)) throw new Error('La base del precio mínimo no es válida.');
    if (minimumPrice === null && minimumPriceBasis) throw new Error('Indicá el precio mínimo correspondiente.');

    const now = new Date().toISOString(), id = crypto.randomUUID();
    const { db, files } = getBindings();
    const imageRows: unknown[][] = [];
    for (let index = 0; index < images.length; index++) {
      const file = images[index];
      if (file.size > MAX_FILE_SIZE) throw new Error(`La foto ${index + 1} supera 3 MB.`);
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!validImage(bytes, file.type)) throw new Error(`La foto ${index + 1} no es JPEG, PNG o WebP válido.`);
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
      const key = `private/seller/${id}/${crypto.randomUUID()}.${extension}`;
      await files.put(key, bytes, { httpMetadata: { contentType: file.type } });
      stored.push(key); imageRows.push([crypto.randomUUID(), id, key, file.type, file.size, index, now]);
    }

    const statements = [
      db.prepare('INSERT INTO seller_requests (id,name,phone,email,department,city,brand,model,version,year,mileage,fuel,transmission,engine,color,doors,asking_price,currency,condition,description,registration,registry_number,is_owner,debt_status,lien_status,accepts_trade_in,minimum_price,minimum_price_basis,visit_zone,status,terms_version,terms_accepted_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(
        id, required(form, 'name', 'tu nombre'), phone(form), email(form), required(form, 'department', 'el departamento'), required(form, 'city', 'la ciudad'), required(form, 'brand', 'la marca'), required(form, 'model', 'el modelo'), optional(form, 'version'), integer(form, 'year', 'El año', 1900, new Date().getFullYear() + 1), integer(form, 'mileage', 'El kilometraje', 0, 2000000), required(form, 'fuel', 'el combustible'), required(form, 'transmission', 'la transmisión'), optional(form, 'engine'), optional(form, 'color'), integer(form, 'doors', 'La cantidad de puertas', 2, 6, true), integer(form, 'askingPrice', 'El precio', 0, 100000000, true), 'USD', required(form, 'condition', 'el estado general'), required(form, 'description', 'la descripción', 3000), optional(form, 'registration', 30), optional(form, 'registryNumber', 40), choice(form, 'isOwner', 'titularidad', yesNo), choice(form, 'debtStatus', 'deuda', yesNoUnknown), choice(form, 'lienStatus', 'gravamen', yesNoUnknown), choice(form, 'acceptsTradeIn', 'permuta', yesNo), minimumPrice, minimumPriceBasis, required(form, 'visitZone', 'la zona para coordinar una visita'), 'PENDIENTE', '2026-09-08-v3', now, now, now,
      ),
      ...imageRows.map((row) => db.prepare('INSERT INTO seller_request_images (id,request_id,object_key,content_type,size,position,created_at) VALUES (?,?,?,?,?,?,?)').bind(...row)),
    ];
    await db.batch(statements);
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    if (stored.length) { try { await getBindings().files.delete(stored); } catch {} }
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'No pudimos recibir tu vehículo.' }, { status: 400 });
  }
}
