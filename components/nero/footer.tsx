import { ArrowUpRight, Camera } from 'lucide-react';
import { BRAND, sitePath } from '../../lib/brand';
import { Logo } from './logo';

export function Footer() {
  return <footer className="site-footer">
    <div className="container footer-main">
      <div><Logo /><p>{BRAND.slogan}</p></div>
      <div className="footer-links">
        <div><span>Explorá</span><a href={sitePath('/vehiculos')}>Vehículos</a><a href={sitePath('/vende-tu-auto')}>Vendé tu auto</a><a href={sitePath('/buscamos-tu-auto')}>Buscamos tu auto</a></div>
        <div><span>Información</span><a href={sitePath('/#como-funciona')}>Cómo funciona</a><a href={sitePath('/sobre-nero')}>Sobre NERO</a><a href={sitePath('/contacto')}>Contacto</a><a href={sitePath('/condiciones')}>Condiciones</a><a href={sitePath('/privacidad')}>Privacidad</a></div>
      </div>
      <a className="footer-instagram" href={BRAND.instagram} target="_blank" rel="noreferrer"><Camera /> {BRAND.instagramHandle}<ArrowUpRight /></a>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} NERO Automóviles</span><span>Uruguay · Intermediación de vehículos</span></div>
  </footer>;
}
