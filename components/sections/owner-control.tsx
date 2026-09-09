import { ArrowUpRight } from 'lucide-react';
import { sitePath } from '@/lib/brand';

const facts = [
  ['0', 'Costo inicial'],
  ['4%', 'Solo si se concreta la venta con un comprador conseguido o gestionado por NERO'],
  ['SIN', 'Exclusividad'],
  ['CON VOS', 'Tu vehículo permanece contigo'],
];

export function OwnerControl() {
  return <section className="owner-control"><div className="container owner-control-head" data-reveal><p className="eyebrow muted">UNA GESTIÓN SIN DESPRENDERTE DE TU AUTO</p><h2>Tu auto sigue <em>con vos.</em></h2><div><p>No necesitás entregarnos tu vehículo ni pagar nada por adelantado. NERO se encarga de presentarlo, promocionarlo, atender consultas, filtrar interesados y acompañar la negociación. Vos decidís sobre cada oferta, podés seguir vendiéndolo por tu cuenta y el pago del vehículo se realiza directamente entre comprador y propietario.</p><a className="button button-light" href={sitePath('/vende-tu-auto')}>Quiero vender mi auto <ArrowUpRight /></a></div></div><div className="container owner-facts" data-reveal>{facts.map(([value, label], index) => <div key={label}><span>0{index + 1}</span><strong>{value}</strong><p>{label}</p></div>)}</div></section>;
}
