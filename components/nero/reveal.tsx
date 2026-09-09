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
    const animateHero = hero && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const render = () => {
      frame = 0;
      if (!hero) return;
      hero.style.setProperty('--mx', `${pointerX}px`);
      hero.style.setProperty('--my', `${pointerY}px`);
      hero.style.setProperty('--scroll', `${Math.min(scrollY * .08, 32)}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const onMove = (event: PointerEvent) => {
      pointerX = (event.clientX / innerWidth - .5) * 10;
      pointerY = (event.clientY / innerHeight - .5) * 6;
      schedule();
    };
    if (animateHero) {
      addEventListener('pointermove', onMove, { passive: true });
      addEventListener('scroll', schedule, { passive: true });
    }
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      if (animateHero) {
        removeEventListener('pointermove', onMove);
        removeEventListener('scroll', schedule);
      }
    };
  }, []);
  return null;
}
