import type { Metadata } from 'next';
import { Camera } from 'lucide-react';
import { InquiryForm } from '@/components/forms/inquiry-form';
import { SiteShell } from '@/components/nero/site-shell';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactá a NERO Automóviles para comprar, vender o buscar un vehículo en Uruguay.',
  alternates: { canonical: '/contacto' },
};

export default function ContactPage() {
  return (
    <SiteShell>
      <main id="contenido" className="inner-page">
        <header className="form-hero container">
          <p className="eyebrow muted">CONTACTO</p>
          <h1>Hablemos de <em>tu próximo paso.</em></h1>
          <p>Contanos qué necesitás. Revisamos cada consulta y coordinamos el contacto de forma personal.</p>
        </header>
        <section className="form-layout container">
          <aside><span>04</span><h2>Compra, venta o búsqueda.</h2><p>También podés escribirnos por Instagram. No publicamos teléfonos ni direcciones que todavía no fueron confirmados por NERO.</p><a className="quiet-link" href={BRAND.instagram} target="_blank" rel="noreferrer"><Camera /> {BRAND.instagramHandle}</a></aside>
          <InquiryForm reason="Consulta general" />
        </section>
      </main>
    </SiteShell>
  );
}
