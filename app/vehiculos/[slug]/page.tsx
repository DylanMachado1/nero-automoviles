import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Fuel, Gauge, MapPin, MessageCircle, Palette, Settings2 } from 'lucide-react';
import { SiteShell } from '@/components/nero/site-shell';
import { InquiryForm } from '@/components/forms/inquiry-form';
import { VehicleGallery } from '@/components/vehicles/vehicle-gallery';
import { getBindings } from '@/db';
import { formatMileage, formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

type VehicleRow = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  price: number | null;
  currency: string;
  mileage: number;
  fuel: string;
  transmission: string;
  engine: string | null;
  department: string;
  city: string;
  color: string | null;
  doors: number | null;
  condition: string | null;
  description: string;
  equipment: string | null;
  additional_info: string | null;
  review_notes: string | null;
  status: string;
};

type ImageRow = { object_key: string; alt: string | null };

const imageUrl = (key: string) => `/api/vehicle-images/${key.split('/').map(encodeURIComponent).join('/')}`;

async function record(slug: string) {
  try {
    const { db } = getBindings();
    const vehicle = await db.prepare(
      "SELECT * FROM vehicles WHERE slug=? AND status IN ('PUBLICADO','RESERVADO','VENDIDO') LIMIT 1",
    ).bind(slug).first<VehicleRow>();
    if (!vehicle) return null;
    const images = await db.prepare(
      'SELECT object_key,alt FROM vehicle_images WHERE vehicle_id=? ORDER BY is_primary DESC,position ASC',
    ).bind(vehicle.id).all<ImageRow>();
    return { vehicle, images: images.results };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await record(slug);
  if (!data) return { title: 'Vehículo no encontrado' };
  const vehicle = data.vehicle;
  return {
    title: `${vehicle.brand} ${vehicle.model} ${vehicle.year} en Uruguay`,
    description: `${vehicle.brand} ${vehicle.model} ${vehicle.year}, ${formatMileage(vehicle.mileage)}. Vehículo gestionado por NERO Automóviles.`,
    alternates: { canonical: `/vehiculos/${slug}` },
    openGraph: {
      title: `${vehicle.brand} ${vehicle.model} ${vehicle.year} | NERO Automóviles`,
      description: `${formatMileage(vehicle.mileage)} · ${vehicle.city}, ${vehicle.department}`,
      images: data.images[0] ? [imageUrl(data.images[0].object_key)] : [],
    },
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await record(slug);
  if (!data) notFound();
  const { vehicle, images } = data;
  const details = [
    [Gauge, formatMileage(vehicle.mileage)],
    [Fuel, vehicle.fuel],
    [Settings2, vehicle.transmission],
    [Palette, vehicle.color || 'Sin especificar'],
    [MapPin, `${vehicle.city}, ${vehicle.department}`],
  ] as const;
  const equipment = vehicle.equipment?.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) ?? [];
  const galleryImages = images.map((image, index) => ({
    src: imageUrl(image.object_key),
    alt: image.alt ?? `${vehicle.brand} ${vehicle.model} — foto ${index + 1}`,
  }));
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '');
  const whatsappText = `Hola NERO, estoy interesado en el ${vehicle.brand} ${vehicle.model} ${vehicle.year} publicado en su web. https://nero-automoviles.dylanvpi1899.chatgpt.site/vehiculos/${vehicle.slug}`;

  return (
    <SiteShell>
      <main id="contenido" className="vehicle-page container">
        <VehicleGallery images={galleryImages} />
        <section className="vehicle-info">
          <p className="eyebrow muted">{vehicle.status}</p>
          <h1>{vehicle.brand} {vehicle.model}</h1>
          {vehicle.version && <p className="vehicle-version">{vehicle.version}</p>}
          <strong className="vehicle-price">{formatPrice(vehicle.price, vehicle.currency)}</strong>
          <div className="vehicle-specs">
            {details.map(([Icon, value]) => <span key={value}><Icon />{value}</span>)}
          </div>
          <article className="vehicle-information"><p className="eyebrow muted">INFORMACIÓN DEL VEHÍCULO</p><h2>Datos principales</h2><p>La ficha reúne la información necesaria para conocer la propuesta y coordinar una consulta con NERO.</p></article>
          <article className="owner-declaration"><p className="eyebrow muted">INFORMACIÓN DECLARADA POR EL PROPIETARIO</p><h2>Descripción y estado informado</h2><p>{vehicle.description}</p></article>
          {equipment.length > 0 && (
            <article>
              <h2>Equipamiento</h2>
              <ul className="equipment-list">{equipment.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          )}
          {vehicle.additional_info && <article><h2>Información adicional declarada</h2><p>{vehicle.additional_info}</p></article>}
          <article className="nero-review"><p className="eyebrow muted">REVISIÓN NERO</p><h2>Alcance de la revisión</h2><p>{vehicle.review_notes || 'NERO todavía no registró observaciones de una revisión adicional para este vehículo. Consultá el alcance antes de tomar una decisión.'}</p></article>
          <aside className="managed-operation"><p className="eyebrow muted">OPERACIÓN GESTIONADA POR NERO</p><div>{['Consultas gestionadas','Propietario identificado','Coordinación de interesados','Acompañamiento en la negociación'].map((item)=><span key={item}>{item}</span>)}</div><p>NERO actúa como intermediario y no ofrece una garantía mecánica del vehículo.</p></aside>
          <div className="vehicle-disclosure">La ubicación pública se limita a ciudad y departamento. NERO coordina el contacto con el propietario.</div>
          {whatsappNumber && <a className="button button-light vehicle-whatsapp" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noreferrer"><MessageCircle /> Consultar por WhatsApp</a>}
          <div className="inquiry-grid">
            <div><h2>Consultar este vehículo</h2><InquiryForm vehicleId={vehicle.id} /></div>
            <div><h2>Hacer una oferta</h2><InquiryForm vehicleId={vehicle.id} offer /></div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
