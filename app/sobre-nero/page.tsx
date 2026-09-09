import type { Metadata } from 'next';
import { ArrowUpRight, Search } from 'lucide-react';
import { SiteShell } from '@/components/nero/site-shell';

export const metadata: Metadata = {
  title: 'Sobre NERO',
  description: 'NERO es un servicio de intermediación digital de vehículos en Uruguay.',
  alternates: { canonical: '/sobre-nero' },
};

export default function AboutPage() {
  return <SiteShell><main id="contenido" className="about-page"><header className="container"><p className="eyebrow muted">SOBRE NERO</p><h1>Una nueva forma de conectar <em>propietarios y compradores.</em></h1></header><section className="container about-statement"><span>01</span><div><h2>NERO Automóviles</h2><p>NERO es un servicio de intermediación digital de vehículos en Uruguay.</p><p>Trabajamos junto al propietario para presentar, promocionar y gestionar la comercialización de su vehículo.</p><p>El vehículo permanece siempre con su dueño y las decisiones sobre precio y ofertas continúan en sus manos.</p><p>También ayudamos a compradores a buscar opciones que se adapten a sus necesidades.</p></div></section><section className="container about-actions"><a className="button button-light" href="/vende-tu-auto">Vendé tu auto <ArrowUpRight /></a><a className="button button-outline" href="/buscamos-tu-auto">Buscamos tu próximo auto <Search /></a></section></main></SiteShell>;
}
