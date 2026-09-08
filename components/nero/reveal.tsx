'use client';
import { useEffect } from 'react';
export function RevealController() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -5%' });
    nodes.forEach((node) => observer.observe(node));
    const hero = document.querySelector<HTMLElement>('.hero-image');
    const onMove = (event: PointerEvent) => { if (hero && matchMedia('(pointer:fine)').matches) { hero.style.setProperty('--mx', `${(event.clientX / innerWidth - .5) * 10}px`); hero.style.setProperty('--my', `${(event.clientY / innerHeight - .5) * 6}px`); } };
    const onScroll = () => { if (hero) hero.style.setProperty('--scroll', `${Math.min(scrollY * .08, 32)}px`); };
    addEventListener('pointermove', onMove, { passive: true }); addEventListener('scroll', onScroll, { passive: true });
    return () => { observer.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('scroll', onScroll); };
  }, []);
  return null;
}
