'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { sitePath } from '../../lib/brand';
import { Logo } from './logo';

const links = [
  ['Vehículos', '/vehiculos'],
  ['Vendé tu auto', '/vende-tu-auto'],
  ['Buscamos tu auto', '/buscamos-tu-auto'],
  ['Cómo funciona', '/#como-funciona'],
  ['Sobre NERO', '/sobre-nero'],
  ['Contacto', '/contacto'],
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 24);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  return <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <div className="container header-inner">
      <a href={sitePath('/')} aria-label="NERO Automóviles, inicio"><Logo compact /></a>
      <nav className="navigation" aria-label="Navegación principal">
        {links.map(([label, href]) => <a key={href} href={sitePath(href)}>{label}</a>)}
      </nav>
      <a href={sitePath('/vende-tu-auto')} className="button header-cta">Vendé tu auto <ArrowUpRight size={16} /></a>
      <button type="button" className="menu-button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="mobile-menu-inner">{links.map(([label, href], i) => <a key={href} href={sitePath(href)} onClick={() => setOpen(false)}><span>0{i + 1}</span>{label}<ArrowUpRight /></a>)}</div>
      <p>NERO Automóviles<br /><span>Tu auto. Nuestra gestión.</span></p>
    </div>
  </header>;
}
