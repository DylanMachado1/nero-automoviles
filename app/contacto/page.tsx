import type { Metadata } from 'next';
import { ArrowRight, Camera, Mail } from 'lucide-react';
import { InquiryForm } from '@/components/forms/inquiry-form';
import { SiteShell } from '@/components/nero/site-shell';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactá a NERO Automóviles para comprar, vender o buscar un vehículo en Uruguay.',
  alternates: { canonical: '/contacto' },
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return (
    <SiteShell>
      <main id="contenido" className="inner-page">
        <header className="form-hero container">
          <p className="eyebrow muted">CONTACTO</p>
          <h1>Hablemos de <em>tu próximo paso.</em></h1>
          <p>Contanos qué necesitás. Revisamos cada consulta y coordinamos el contacto de forma personal.</p>
        </header>
        <section className="form-layout container">
          <aside><span>04</span><h2>Compra, venta o búsqueda.</h2><p>Elegí el camino que mejor describe lo que necesitás o escribinos por nuestro canal actual.</p><div className="contact-paths"><a href="/vende-tu-auto">Quiero vender mi auto <ArrowRight /></a><a href="/buscamos-tu-auto">Estoy buscando un auto <ArrowRight /></a></div><a className="quiet-link" href={BRAND.instagram} target="_blank" rel="noreferrer"><Camera /> {BRAND.instagramHandle}</a>{contactEmail ? <a className="quiet-link" href={`mailto:${contactEmail}`}><Mail /> {contactEmail}</a> : null}</aside>
          <InquiryForm reason="Consulta general" />
        </section>
      </main>
    </SiteShell>
  );
}
