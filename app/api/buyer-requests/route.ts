import { getBindings } from '@/db';
import { enforceRateLimit } from '@/lib/rate-limit';
import { assertHoneypot, assertSameOrigin, clean, email, integer, optional, phone, required } from '@/validators/requests';

export const runtime = 'edge';
const allowedPayment = new Set(['cash', 'financing', 'undecided']);
const allowedTimeline = new Set(['asap', 'this_month', 'one_to_three_months', 'evaluating']);
const allowedYesNo = new Set(['yes', 'no']);
const allowedPriorities = new Set(['Precio', 'Año', 'Kilometraje', 'Consumo', 'Transmisión automática', 'Equipamiento', 'Espacio', 'Seguridad', 'Otro']);

function choice(form: FormData, name: string, label: string, allowed: Set<string>) {
  const value = required(form, name, label, 40);
  if (!allowed.has(value)) throw new Error(`La opción de ${label} no es válida.`);
  return value;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request); await enforceRateLimit(request, 'buyer');
    const form = await request.formData(); assertHoneypot(form);
    const min = integer(form, 'minBudget', 'El presupuesto mínimo', 0, 100000000, true);
    const max = integer(form, 'maxBudget', 'El presupuesto máximo', 0, 100000000, true);
    if (min !== null && max !== null && min > max) throw new Error('El presupuesto mínimo no puede superar al máximo.');
    const priorities = form.getAll('priorities').map((value) => clean(value, 40)).filter((value) => allowedPriorities.has(value));
    if (priorities.length !== form.getAll('priorities').length) throw new Error('Una prioridad seleccionada no es válida.');

    const now = new Date().toISOString(), id = crypto.randomUUID();
    const { db } = getBindings();
    await db.prepare('INSERT INTO buyer_requests (id,name,phone,email,preferred_brand,preferred_model,vehicle_type,min_budget,max_budget,currency,min_year,max_mileage,fuel,transmission,department,nationwide,payment_method,has_trade_in,purchase_timeline,priorities,comments,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(
      id, required(form, 'name', 'tu nombre'), phone(form), email(form), optional(form, 'brand'), optional(form, 'model'), optional(form, 'vehicleType'), min, max, 'USD', integer(form, 'minYear', 'El año mínimo', 1900, new Date().getFullYear() + 1, true), integer(form, 'maxMileage', 'El kilometraje máximo', 0, 2000000, true), optional(form, 'fuel'), optional(form, 'transmission'), optional(form, 'department'), form.get('nationwide') === 'yes' ? 1 : 0, choice(form, 'paymentMethod', 'forma de pago', allowedPayment), choice(form, 'hasTradeIn', 'vehículo para entregar', allowedYesNo), choice(form, 'purchaseTimeline', 'momento de compra', allowedTimeline), priorities.length ? JSON.stringify(priorities) : null, optional(form, 'comments', 3000), 'NUEVA', now, now,
    ).run();
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'No pudimos guardar tu búsqueda.' }, { status: 400 });
  }
}
